import { ModelType, ProviderType, VariantType } from '@/types';

export const FEATURE_FLAGS = {
  ARENA_MVP_V2: process.env.ARENA_MVP_V2 !== 'false',
  AI_EVALUATION: process.env.AI_EVALUATION !== 'false',
} as const;

export const ALL_MODELS: ModelType[] = ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'];
export const DEFAULT_MODELS: ModelType[] = ['gpt-4o-mini', 'claude-3-5-haiku'];
export const DEFAULT_VARIANTS: VariantType[] = ['concise', 'story-driven'];

/** Randomly selects `count` models from the available pool for a run */
export function selectModelsForRun(allModels: ModelType[] = ALL_MODELS, count = 3): ModelType[] {
  const shuffled = [...allModels].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const RATE_LIMIT_PER_IP = parseInt(process.env.RATE_LIMIT_PER_IP || '10', 10);
export const DAILY_BUDGET_LIMIT = parseFloat(process.env.DAILY_BUDGET_LIMIT || '10');
export const MAX_PROMPT_LENGTH = parseInt(process.env.MAX_PROMPT_LENGTH || '1000', 10);
export const MIN_PROMPT_LENGTH = 3;
export const API_TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_SECONDS || '15', 10) * 1000;
export const MAX_RESPONSE_TOKENS = 1000;

export const MAX_DRAFTS_PER_RUN = 6;
export const STATS_CACHE_TTL_MS = 30_000;

export const MAX_CONCURRENT_GENERATIONS_GLOBAL = parseInt(
  process.env.MAX_CONCURRENT_GENERATIONS_GLOBAL || '20',
  10
);
export const MAX_CONCURRENT_GENERATIONS_PER_IP = parseInt(
  process.env.MAX_CONCURRENT_GENERATIONS_PER_IP || '3',
  10
);

export const MODEL_DISPLAY_NAMES: Record<ModelType, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-5-haiku': 'Claude 3.5 Haiku',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
};

export const PROVIDER_NAMES: Record<ModelType, string> = {
  'gpt-4o-mini': 'OpenAI',
  'claude-3-5-haiku': 'Anthropic',
  'gemini-2.0-flash': 'Google',
};

/** Maps ModelType to the provider-specific API model ID */
export const MODEL_REGISTRY: Record<ModelType, { apiModelId: string; provider: ProviderType }> = {
  'gpt-4o-mini': { apiModelId: 'gpt-4o-mini', provider: 'openai' },
  'claude-3-5-haiku': { apiModelId: 'claude-3-5-haiku-20241022', provider: 'anthropic' },
  'gemini-2.0-flash': { apiModelId: 'gemini-2.0-flash', provider: 'google' },
};

// --- Evaluator scoring constants ---

/** Jaccard similarity threshold for clustering similar drafts */
export const SIMILARITY_THRESHOLD = 0.8;

/** Chars-per-token ratio for rough token estimation */
export const CHARS_PER_TOKEN = 4;

/** Vote scoring weights */
export const VOTE_WEIGHT_WINNER = 2;
export const VOTE_WEIGHT_TIE = 1;

/** Clarity scoring */
export const CLARITY_BASE_SHORT = 72;
export const CLARITY_BASE_LONG = 76;
export const CLARITY_BASE_IDEAL = 85;
export const CLARITY_SHORT_THRESHOLD = 120;
export const CLARITY_LONG_THRESHOLD = 600;

/** Human-feel scoring */
export const HUMAN_FEEL_BASE = 60;
export const HUMAN_FEEL_CAP = 95;

/** Platform-fit scoring */
export const PLATFORM_FIT_BASE_LINKEDIN = 65;
export const PLATFORM_FIT_BASE_EMAIL = 62;
export const PLATFORM_FIT_CAP = 96;
