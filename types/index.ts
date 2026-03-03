// ============================================
// BlindLane TypeScript Types
// These define the shape of our data
// ============================================

// The two models we support in MVP
export type ModelType = 'gpt-4o-mini' | 'claude-3-5-haiku';

// A user's vote
export type VoteResult = 'A' | 'B' | 'TIE';

// A comparison session
export interface Comparison {
  id: string;
  created_at: string;
  prompt_text: string;
  prompt_length: number;
  model_a: ModelType;
  model_b: ModelType;
  response_a: string;
  response_b: string;
  tokens_input_a: number;
  tokens_output_a: number;
  tokens_input_b: number;
  tokens_output_b: number;
  cost_a_usd: number;
  cost_b_usd: number;
  total_cost_usd: number;
  winner: VoteResult | null;
  voted_at: string | null;
  user_id: string | null;
  ip_address: string | null;
}

// What we send to the API to create a comparison
export interface CreateComparisonRequest {
  prompt: string;
}

// What the API returns after creating a comparison
export interface CreateComparisonResponse {
  success: boolean;
  comparison?: Comparison;
  error?: string;
  rateLimitInfo?: {
    current: number;
    limit: number;
    remaining: number;
  };
}

// What we send to vote
export interface VoteRequest {
  comparisonId: string;
  vote: VoteResult;
}

// What the API returns for voting
export interface VoteResponse {
  success: boolean;
  comparison?: Comparison;
  error?: string;
}

// For displaying in the UI
export interface ComparisonDisplay {
  id: string;
  prompt: string;
  modelA: {
    label: 'A';
    response: string;
    isStreaming: boolean;
  };
  modelB: {
    label: 'B';
    response: string;
    isStreaming: boolean;
  };
  hasVoted: boolean;
  winner?: VoteResult;
  revealed: boolean;
}

// Cost info for display
export interface CostInfo {
  modelA: {
    name: string;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  };
  modelB: {
    name: string;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  };
  total: number;
}

// Stats for the leaderboard
export interface ModelStats {
  model_name: string;
  total_votes: number;
  wins: number;
  losses: number;
  ties: number;
  win_rate: number;
}

// API pricing (per 1M tokens)
export const MODEL_PRICING = {
  'gpt-4o-mini': {
    input: 0.15,   // $0.15 per 1M input tokens
    output: 0.60,  // $0.60 per 1M output tokens
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
  },
  'claude-3-5-haiku': {
    input: 0.25,   // $0.25 per 1M input tokens
    output: 1.25,  // $1.25 per 1M output tokens
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
  },
} as const;

// Helper to calculate cost
export function calculateCost(
  model: ModelType,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}
