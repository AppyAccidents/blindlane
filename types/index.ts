export type ModelType = 'gpt-4o-mini' | 'claude-3-5-haiku' | 'gemini-2.0-flash';
export type ProviderType = 'openai' | 'anthropic' | 'google';
export type VariantType = 'concise' | 'story-driven';
export type PlatformDestination = 'linkedin' | 'email';

export type RunPhase = 'gallery' | 'compare' | 'converged';
export type DraftStatus = 'ok' | 'timeout' | 'error';

export type PairVoteChoice = 'BETTER_A' | 'BETTER_B' | 'TIE' | 'SKIP';
export type LegacyVoteResult = 'A' | 'B' | 'TIE';

export interface DraftResult {
  id: string;
  label: string;
  content: string;
  contentPreview: string;
  model: ModelType;
  variant: VariantType;
  status: DraftStatus;
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  costUsd: number;
  latencyMs: number;
  errorReason?: 'timeout' | 'provider_error';
}

export type HighlightCategory = 'hook' | 'impact' | 'cta' | 'insight' | 'weakness';

export interface DraftHighlight {
  text: string;
  startIndex: number;
  endIndex: number;
  category: HighlightCategory;
  reason: string;
}

export interface AiEvaluation {
  draftId: string;
  highlights: DraftHighlight[];
  summary: string;
  strengthScore: number;
}

export interface DraftEvaluation {
  draftId: string;
  tags: {
    tone: string;
    angle: string;
  };
  scores: {
    clarity: number;
    humanFeel: number;
    platformFit: number;
  };
  similarityClusterId: string;
  shortlistLabel?: 'TOP_PICK' | 'RUNNER_UP';
  aiHighlights?: DraftHighlight[];
  aiSummary?: string;
}

export interface ComparePair {
  id: string;
  draftAId: string;
  draftBId: string;
}

export interface VoteEvent {
  pairId: string;
  vote: PairVoteChoice;
  createdAt: string;
}

export interface ArenaRunData {
  phase: RunPhase;
  drafts: DraftResult[];
  evaluations: DraftEvaluation[];
  comparePairs: ComparePair[];
  votes: VoteEvent[];
  winnerDraftId: string | null;
  discardedDraftIds: string[];
  targetPlatform: PlatformDestination;
  reveal: RevealItem[];
}

export interface ArenaDraftPreview {
  id: string;
  label: string;
  contentPreview: string;
  contentFull: string;
  evaluatorPreview: {
    tags: string[];
    clarity: number;
    humanFeel: number;
    platformFit: number;
    shortlistLabel?: 'TOP_PICK' | 'RUNNER_UP';
    highlights?: DraftHighlight[];
    aiSummary?: string;
  };
}

export interface ArenaRunPreview {
  id: string;
  promptText: string;
  drafts: ArenaDraftPreview[];
  phase: RunPhase;
  comparePairs: ComparePair[];
}

export interface RevealItem {
  draftId: string;
  model: ModelType;
  variant: VariantType;
  cost: number;
  latency: number;
  tokens: number;
}

export interface ArenaRunRevealed extends ArenaRunPreview {
  winnerDraftId: string;
  discardedDraftIds: string[];
  reveal: RevealItem[];
}

export interface ComparisonRow {
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
  winner: LegacyVoteResult | null;
  voted_at: string | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  run_phase?: RunPhase | null;
  drafts_json?: ArenaRunData['drafts'] | null;
  evaluations_json?: ArenaRunData['evaluations'] | null;
  votes_json?: ArenaRunData['votes'] | null;
  winner_draft_id?: string | null;
  discarded_draft_ids?: string[] | null;
  reveal_json?: RevealItem[] | null;
}

export interface CreateComparisonRequest {
  prompt: string;
  targetPlatform?: PlatformDestination;
  keySource?: 'platform' | 'user';
  userKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}

export interface CreateComparisonResponse {
  success: boolean;
  run?: ArenaRunPreview;
  error?: string;
  degradedCount?: number;
  rateLimitInfo?: {
    current: number;
    limit: number;
    remaining: number;
  };
}

export interface VoteRequest {
  runId: string;
  pairId: string;
  vote: PairVoteChoice;
}

export interface VoteResponse {
  success: boolean;
  pairId?: string;
  vote?: PairVoteChoice;
  aggregateSignals?: {
    completedVotes: number;
    totalPairs: number;
    scores: Record<string, number>;
  };
  error?: string;
}

export interface ConvergeRequest {
  runId: string;
  winnerDraftId: string;
}

export interface ConvergeResponse {
  success: boolean;
  workingDraft?: {
    draftId: string;
    content: string;
  };
  discardedDraftIds?: string[];
  reveal?: RevealItem[];
  error?: string;
}

export interface FormatRequest {
  runId: string;
  draftId?: string;
  destination: PlatformDestination;
}

export interface FormatResponse {
  success: boolean;
  formattedContent?: string;
  markdown?: string;
  metadata?: Record<string, string | string[]>;
  error?: string;
}

export interface ModelStats {
  model_name: string;
  total_votes: number;
  wins: number;
  losses: number;
  ties: number;
  win_rate: number;
}

export const MODEL_PRICING = {
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60,
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
  },
  'claude-3-5-haiku': {
    input: 0.25,
    output: 1.25,
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
  },
  'gemini-2.0-flash': {
    input: 0.10,
    output: 0.40,
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
  },
} as const;

// Legacy aliases for compatibility while migrating
export type Comparison = ComparisonRow;
export type VoteResult = LegacyVoteResult;
