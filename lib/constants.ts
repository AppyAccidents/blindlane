// ============================================
// Constants
// App-wide configuration values
// ============================================

// Rate limiting
export const RATE_LIMIT_PER_IP = parseInt(process.env.RATE_LIMIT_PER_IP || '10');

// Cost control
export const DAILY_BUDGET_LIMIT = parseFloat(process.env.DAILY_BUDGET_LIMIT || '10');

// Prompt constraints
export const MAX_PROMPT_LENGTH = parseInt(process.env.MAX_PROMPT_LENGTH || '1000');
export const MIN_PROMPT_LENGTH = 3;

// API timeout (in milliseconds)
export const API_TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_SECONDS || '15') * 1000;

// Response constraints (to control costs)
export const MAX_RESPONSE_TOKENS = 1000;

// Model display names
export const MODEL_DISPLAY_NAMES = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-5-haiku': 'Claude 3.5 Haiku',
} as const;

// Provider names
export const PROVIDER_NAMES = {
  'gpt-4o-mini': 'OpenAI',
  'claude-3-5-haiku': 'Anthropic',
} as const;
