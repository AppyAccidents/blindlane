import { createClient } from '@supabase/supabase-js';
import {
  ArenaRunData,
  ComparisonRow,
  ConvergeResponse,
  DraftEvaluation,
  DraftResult,
  ModelStats,
  PlatformDestination,
  RunPhase,
  VoteEvent,
} from '@/types';
import {
  DAILY_BUDGET_LIMIT,
  RATE_LIMIT_PER_IP,
} from '@/lib/config';
import { buildInitialPairs } from '@/lib/converge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export function buildArenaRunData(
  drafts: DraftResult[],
  evaluations: DraftEvaluation[],
  targetPlatform: PlatformDestination,
  phase: RunPhase = 'gallery',
  votes: VoteEvent[] = [],
  winnerDraftId: string | null = null,
  discardedDraftIds: string[] = [],
  reveal: ConvergeResponse['reveal'] = []
): ArenaRunData {
  return {
    phase,
    drafts,
    evaluations,
    comparePairs: buildInitialPairs(drafts),
    votes,
    winnerDraftId,
    discardedDraftIds,
    targetPlatform,
    reveal: reveal || [],
  };
}

function rowToArenaRun(row: ComparisonRow): ArenaRunData {
  if (row.drafts_json && row.evaluations_json) {
    const drafts = row.drafts_json;
    const evaluations = row.evaluations_json;
    return {
      phase: row.run_phase || 'gallery',
      drafts,
      evaluations,
      comparePairs: buildInitialPairs(drafts),
      votes: row.votes_json || [],
      winnerDraftId: row.winner_draft_id || null,
      discardedDraftIds: row.discarded_draft_ids || [],
      targetPlatform: 'linkedin',
      reveal: row.reveal_json || [],
    };
  }

  const legacyDrafts: DraftResult[] = [
    {
      id: 'draft_1',
      label: 'A',
      content: row.response_a,
      contentPreview: row.response_a.slice(0, 160),
      model: row.model_a,
      variant: 'concise',
      status: 'ok',
      inputTokens: row.tokens_input_a,
      outputTokens: row.tokens_output_a,
      tokens: row.tokens_input_a + row.tokens_output_a,
      costUsd: row.cost_a_usd,
      latencyMs: 0,
    },
    {
      id: 'draft_2',
      label: 'B',
      content: row.response_b,
      contentPreview: row.response_b.slice(0, 160),
      model: row.model_b,
      variant: 'story-driven',
      status: 'ok',
      inputTokens: row.tokens_input_b,
      outputTokens: row.tokens_output_b,
      tokens: row.tokens_input_b + row.tokens_output_b,
      costUsd: row.cost_b_usd,
      latencyMs: 0,
    },
  ];

  return {
    phase: row.winner ? 'converged' : 'gallery',
    drafts: legacyDrafts,
    evaluations: [],
    comparePairs: buildInitialPairs(legacyDrafts),
    votes: [],
    winnerDraftId: row.winner ? (row.winner === 'A' ? 'draft_1' : 'draft_2') : null,
    discardedDraftIds: [],
    targetPlatform: 'linkedin',
    reveal: row.winner
      ? [
          {
            draftId: 'draft_1',
            model: row.model_a,
            variant: 'concise',
            cost: row.cost_a_usd,
            latency: 0,
            tokens: row.tokens_input_a + row.tokens_output_a,
          },
          {
            draftId: 'draft_2',
            model: row.model_b,
            variant: 'story-driven',
            cost: row.cost_b_usd,
            latency: 0,
            tokens: row.tokens_input_b + row.tokens_output_b,
          },
        ]
      : [],
  };
}

export async function createArenaRun(params: {
  promptText: string;
  ipHash: string;
  userAgent: string | null;
  data: ArenaRunData;
}) {
  const { promptText, ipHash, userAgent, data } = params;
  const first = data.drafts[0];
  const second = data.drafts[1] || first;

  const payload = {
    prompt_text: promptText,
    prompt_length: promptText.length,
    model_a: first.model,
    model_b: second.model,
    response_a: first.content,
    response_b: second.content,
    tokens_input_a: first.inputTokens,
    tokens_output_a: first.outputTokens,
    tokens_input_b: second.inputTokens,
    tokens_output_b: second.outputTokens,
    cost_a_usd: first.costUsd,
    cost_b_usd: second.costUsd,
    total_cost_usd: data.drafts.reduce((sum, draft) => sum + draft.costUsd, 0),
    winner: null,
    user_id: null,
    ip_address: ipHash,
    user_agent: userAgent,
    run_phase: data.phase,
    drafts_json: data.drafts,
    evaluations_json: data.evaluations,
    votes_json: data.votes,
    winner_draft_id: data.winnerDraftId,
    discarded_draft_ids: data.discardedDraftIds,
    reveal_json: data.reveal,
  };

  const { data: created, error } = await supabaseAdmin
    .from('comparisons')
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating arena run:', error);
    return null;
  }

  return created as ComparisonRow;
}

export async function getArenaRun(id: string): Promise<{ row: ComparisonRow; run: ArenaRunData } | null> {
  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as ComparisonRow;
  return {
    row,
    run: rowToArenaRun(row),
  };
}

export async function updateArenaRun(id: string, run: ArenaRunData): Promise<ComparisonRow | null> {
  const totalCost = run.drafts.reduce((sum, draft) => sum + draft.costUsd, 0);

  const { data, error } = await supabaseAdmin
    .from('comparisons')
    .update({
      run_phase: run.phase,
      drafts_json: run.drafts,
      evaluations_json: run.evaluations,
      votes_json: run.votes,
      winner_draft_id: run.winnerDraftId,
      discarded_draft_ids: run.discardedDraftIds,
      reveal_json: run.reveal,
      total_cost_usd: totalCost,
      voted_at: run.phase === 'converged' ? new Date().toISOString() : null,
      winner:
        run.phase === 'converged' && run.winnerDraftId
          ? run.winnerDraftId === 'draft_1'
            ? 'A'
            : run.winnerDraftId === 'draft_2'
            ? 'B'
            : 'TIE'
          : null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating arena run:', error);
    return null;
  }

  return data as ComparisonRow;
}

export async function checkAndIncrementLimits(ipHash: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  dailyCost: number;
}> {
  const { data, error } = await supabaseAdmin.rpc('check_and_increment_limits', {
    p_ip_address: ipHash,
    p_rate_limit: RATE_LIMIT_PER_IP,
    p_daily_budget: DAILY_BUDGET_LIMIT,
  });

  if (!error && data) {
    return {
      allowed: !!data.allowed,
      current: Number(data.current || 0),
      limit: Number(data.limit || RATE_LIMIT_PER_IP),
      remaining: Number(data.remaining || 0),
      dailyCost: Number(data.daily_cost || 0),
    };
  }

  const rate = await checkRateLimit(ipHash);
  const dailyCost = await getDailyCost();

  if (rate.allowed && dailyCost < DAILY_BUDGET_LIMIT) {
    await incrementRateLimit(ipHash);
    return {
      allowed: true,
      current: rate.current + 1,
      limit: rate.limit,
      remaining: Math.max(0, rate.remaining - 1),
      dailyCost,
    };
  }

  return {
    allowed: false,
    current: rate.current,
    limit: rate.limit,
    remaining: rate.remaining,
    dailyCost,
  };
}

export async function getVoteStats(): Promise<ModelStats[]> {
  const cached = await supabaseAdmin.from('vote_stats_cached').select('*');
  if (!cached.error && cached.data) {
    return cached.data as ModelStats[];
  }

  const { data, error } = await supabaseAdmin.from('vote_stats').select('*');
  if (error || !data) {
    return [];
  }
  return data as ModelStats[];
}

export async function checkRateLimit(ipAddress: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const { data, error } = await supabaseAdmin.rpc('get_rate_limit', { p_ip_address: ipAddress });
  if (error) {
    return { allowed: true, current: 0, limit: RATE_LIMIT_PER_IP, remaining: RATE_LIMIT_PER_IP };
  }

  const current = data || 0;
  const remaining = Math.max(0, RATE_LIMIT_PER_IP - current);
  return {
    allowed: current < RATE_LIMIT_PER_IP,
    current,
    limit: RATE_LIMIT_PER_IP,
    remaining,
  };
}

export async function incrementRateLimit(ipAddress: string): Promise<number> {
  const { data } = await supabaseAdmin.rpc('increment_rate_limit', { p_ip_address: ipAddress });
  return data || 0;
}

export async function getDailyCost(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabaseAdmin
    .from('daily_costs')
    .select('total_cost_usd')
    .eq('date', today)
    .single();

  if (!data) {
    return 0;
  }

  return Number(data.total_cost_usd || 0);
}

export async function getRecentComparisons(
  userId?: string,
  ipAddress?: string,
  limit = 10
): Promise<ComparisonRow[]> {
  let query = supabaseAdmin
    .from('comparisons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (ipAddress) {
    query = query.eq('ip_address', ipAddress);
  }

  const { data } = await query;
  return (data || []) as ComparisonRow[];
}
