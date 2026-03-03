-- ============================================
-- BlindLane Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Row Level Security (RLS)
alter database postgres set "app.settings.jwt_secret" to 'your-jwt-secret';

-- ============================================
-- 1. COMPARISONS TABLE
-- Stores each A/B comparison session
-- ============================================
create table if not exists comparisons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- The user's prompt
  prompt_text text not null,
  prompt_length integer not null,
  
  -- Which model was assigned to A and B (randomized)
  model_a text not null check (model_a in ('gpt-4o-mini', 'claude-3-5-haiku')),
  model_b text not null check (model_b in ('gpt-4o-mini', 'claude-3-5-haiku')),
  
  -- Responses from each model
  response_a text not null,
  response_b text not null,
  
  -- Token usage for cost calculation
  tokens_input_a integer default 0,
  tokens_output_a integer default 0,
  tokens_input_b integer default 0,
  tokens_output_b integer default 0,
  
  -- Cost in USD (calculated from token usage)
  cost_a_usd decimal(10,6) default 0,
  cost_b_usd decimal(10,6) default 0,
  total_cost_usd decimal(10,6) default 0,
  
  -- User voting result
  winner text check (winner in ('A', 'B', 'TIE')),
  voted_at timestamp with time zone,
  
  -- User identification (null for anonymous users)
  user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  
  -- For rate limiting
  user_agent text
);

-- Create indexes for common queries
create index idx_comparisons_created_at on comparisons(created_at desc);
create index idx_comparisons_user_id on comparisons(user_id);
create index idx_comparisons_ip_address on comparisons(ip_address);
create index idx_comparisons_voted_at on comparisons(voted_at) where voted_at is not null;

-- Enable RLS
alter table comparisons enable row level security;

-- RLS Policies
-- Users can only read their own comparisons
-- Anonymous users can't read (we'll handle this in the app)
create policy "Users can view own comparisons"
  on comparisons for select
  using (auth.uid() = user_id);

-- Anyone can insert (for anonymous comparisons)
create policy "Anyone can create comparisons"
  on comparisons for insert
  with check (true);

-- Users can only update their own comparisons (for voting)
create policy "Users can update own comparisons"
  on comparisons for update
  using (auth.uid() = user_id);

-- ============================================
-- 2. VOTE_STATS VIEW
-- Aggregated statistics for the leaderboard
-- ============================================
create or replace view vote_stats as
select 
  model as model_name,
  count(*) as total_votes,
  count(*) filter (where result = 'win') as wins,
  count(*) filter (where result = 'loss') as losses,
  count(*) filter (where result = 'tie') as ties,
  round(
    count(*) filter (where result = 'win')::numeric / 
    nullif(count(*) filter (where result in ('win', 'loss')), 0) * 100, 
    1
  ) as win_rate
from (
  -- Count votes where model A won
  select 
    model_a as model,
    case 
      when winner = 'A' then 'win'
      when winner = 'B' then 'loss'
      when winner = 'TIE' then 'tie'
    end as result
  from comparisons
  where winner is not null
  
  union all
  
  -- Count votes where model B won
  select 
    model_b as model,
    case 
      when winner = 'B' then 'win'
      when winner = 'A' then 'loss'
      when winner = 'TIE' then 'tie'
    end as result
  from comparisons
  where winner is not null
) votes
group by model;

-- ============================================
-- 3. DAILY_COST_TRACKING TABLE
-- For budget control
-- ============================================
create table if not exists daily_costs (
  id uuid default gen_random_uuid() primary key,
  date date not null unique default current_date,
  total_comparisons integer default 0,
  total_cost_usd decimal(10,6) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to update daily costs automatically
create or replace function update_daily_costs()
returns trigger as $$
begin
  insert into daily_costs (date, total_comparisons, total_cost_usd)
  values (
    current_date, 
    1, 
    coalesce(new.total_cost_usd, 0)
  )
  on conflict (date)
  do update set
    total_comparisons = daily_costs.total_comparisons + 1,
    total_cost_usd = daily_costs.total_cost_usd + excluded.total_cost_usd,
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-update daily costs
create trigger update_daily_costs_trigger
  after insert on comparisons
  for each row
  execute function update_daily_costs();

-- ============================================
-- 4. RATE_LIMITING TABLE
-- Track requests per IP for rate limiting
-- ============================================
create table if not exists rate_limits (
  id uuid default gen_random_uuid() primary key,
  ip_address text not null,
  request_date date not null default current_date,
  request_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ip_address, request_date)
);

-- Index for fast rate limit lookups
create index idx_rate_limits_lookup on rate_limits(ip_address, request_date);

-- Function to increment rate limit
create or replace function increment_rate_limit(p_ip_address text)
returns integer as $$
declare
  current_count integer;
begin
  insert into rate_limits (ip_address, request_count)
  values (p_ip_address, 1)
  on conflict (ip_address, request_date)
  do update set
    request_count = rate_limits.request_count + 1,
    updated_at = timezone('utc'::text, now())
  returning request_count into current_count;
  
  return current_count;
end;
$$ language plpgsql security definer;

-- Function to get current rate limit
create or replace function get_rate_limit(p_ip_address text)
returns integer as $$
declare
  current_count integer;
begin
  select request_count into current_count
  from rate_limits
  where ip_address = p_ip_address
    and request_date = current_date;
  
  return coalesce(current_count, 0);
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. USER_PREFERENCES TABLE (Optional)
-- For storing user settings
-- ============================================
create table if not exists user_preferences (
  id uuid references auth.users(id) on delete cascade primary key,
  default_model_a text check (default_model_a in ('gpt-4o-mini', 'claude-3-5-haiku')),
  default_model_b text check (default_model_b in ('gpt-4o-mini', 'claude-3-5-haiku')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
comment on table comparisons is 'Stores all A/B comparison sessions between LLMs';
comment on column comparisons.model_a is 'Which LLM was assigned to position A (randomized)';
comment on column comparisons.model_b is 'Which LLM was assigned to position B (randomized)';
comment on column comparisons.winner is 'Users vote: A, B, or TIE';
comment on column comparisons.cost_a_usd is 'Cost of API call for model A';
comment on column comparisons.cost_b_usd is 'Cost of API call for model B';

-- ============================================
-- SAMPLE DATA (for testing)
-- Uncomment if you want test data
-- ============================================
/*
insert into comparisons (
  prompt_text, prompt_length,
  model_a, model_b,
  response_a, response_b,
  tokens_input_a, tokens_output_a,
  tokens_input_b, tokens_output_b,
  cost_a_usd, cost_b_usd, total_cost_usd,
  winner, voted_at
) values (
  'Explain quantum computing in simple terms',
  45,
  'gpt-4o-mini', 'claude-3-5-haiku',
  'Quantum computing is like...', 'Imagine a computer that...',
  50, 200, 50, 180,
  0.00015, 0.00018, 0.00033,
  'A',
  timezone('utc'::text, now())
);
*/
