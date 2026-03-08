-- Arena MVP transitional schema changes

alter table comparisons
  add column if not exists run_phase text default 'gallery',
  add column if not exists drafts_json jsonb,
  add column if not exists evaluations_json jsonb,
  add column if not exists votes_json jsonb,
  add column if not exists winner_draft_id text,
  add column if not exists discarded_draft_ids jsonb,
  add column if not exists reveal_json jsonb;

create index if not exists idx_comparisons_run_phase on comparisons(run_phase);

create table if not exists vote_stats_cached (
  model_name text primary key,
  total_votes bigint not null default 0,
  wins bigint not null default 0,
  losses bigint not null default 0,
  ties bigint not null default 0,
  win_rate numeric(5,1) not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function refresh_vote_stats_cached()
returns void as $$
begin
  delete from vote_stats_cached;

  insert into vote_stats_cached (model_name, total_votes, wins, losses, ties, win_rate, updated_at)
  select
    model_name,
    total_votes,
    wins,
    losses,
    ties,
    win_rate,
    timezone('utc'::text, now())
  from vote_stats;
end;
$$ language plpgsql security definer;

select refresh_vote_stats_cached();

create or replace function refresh_vote_stats_cached_trigger_fn()
returns trigger as $$
begin
  perform refresh_vote_stats_cached();
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists refresh_vote_stats_cached_trigger on comparisons;
create trigger refresh_vote_stats_cached_trigger
  after insert or update of winner on comparisons
  for each statement
  execute function refresh_vote_stats_cached_trigger_fn();

create or replace function check_and_increment_limits(
  p_ip_address text,
  p_rate_limit integer,
  p_daily_budget numeric
)
returns table (
  allowed boolean,
  current integer,
  limit integer,
  remaining integer,
  daily_cost numeric
) as $$
declare
  current_count integer;
  current_daily_cost numeric;
begin
  select coalesce(total_cost_usd, 0)
  into current_daily_cost
  from daily_costs
  where date = current_date;

  current_daily_cost := coalesce(current_daily_cost, 0);

  insert into rate_limits (ip_address, request_count)
  values (p_ip_address, 1)
  on conflict (ip_address, request_date)
  do update set
    request_count = rate_limits.request_count + 1,
    updated_at = timezone('utc'::text, now())
  returning request_count into current_count;

  if current_count > p_rate_limit or current_daily_cost >= p_daily_budget then
    update rate_limits
    set request_count = greatest(0, request_count - 1)
    where ip_address = p_ip_address
      and request_date = current_date;

    return query
    select false, greatest(0, current_count - 1), p_rate_limit, greatest(0, p_rate_limit - greatest(0, current_count - 1)), current_daily_cost;
    return;
  end if;

  return query
  select true, current_count, p_rate_limit, greatest(0, p_rate_limit - current_count), current_daily_cost;
end;
$$ language plpgsql security definer;
