/**
 * Mock Supabase Client for Testing
 * 
 * Provides mock implementations of Supabase client methods
 * for use in unit and integration tests.
 */

import { jest } from '@jest/globals';

// ============================================
// Mock Data Factories
// ============================================

export const createMockComparison = (overrides = {}) => ({
  id: `test-${Math.random().toString(36).substring(7)}`,
  created_at: new Date().toISOString(),
  prompt_text: 'Test prompt',
  prompt_length: 12,
  model_a: 'gpt-4o-mini' as const,
  model_b: 'claude-3-5-haiku' as const,
  response_a: 'Response from model A',
  response_b: 'Response from model B',
  tokens_input_a: 10,
  tokens_output_a: 50,
  tokens_input_b: 10,
  tokens_output_b: 60,
  cost_a_usd: 0.00015,
  cost_b_usd: 0.00025,
  total_cost_usd: 0.0004,
  winner: null as 'A' | 'B' | 'TIE' | null,
  voted_at: null as string | null,
  user_id: null,
  ip_address: '127.0.0.1',
  user_agent: 'test-agent',
  ...overrides,
});

export const createMockVoteStats = (overrides = {}) => ({
  model_name: 'gpt-4o-mini',
  total_votes: 100,
  wins: 60,
  losses: 30,
  ties: 10,
  win_rate: 66.7,
  ...overrides,
});

export const createMockDailyCost = (overrides = {}) => ({
  date: new Date().toISOString().split('T')[0],
  total_comparisons: 50,
  total_cost_usd: 0.02,
  ...overrides,
});

// ============================================
// Chainable Query Builder Mock
// ============================================

export class MockSupabaseQueryBuilder {
  private data: any = null;
  private error: any = null;
  private shouldThrow = false;

  constructor(initialData: any = null, error: any = null) {
    this.data = initialData;
    this.error = error;
  }

  select = jest.fn().mockReturnThis();
  insert = jest.fn().mockReturnThis();
  update = jest.fn().mockReturnThis();
  delete = jest.fn().mockReturnThis();
  upsert = jest.fn().mockReturnThis();
  
  from = jest.fn().mockReturnThis();
  
  eq = jest.fn().mockReturnThis();
  neq = jest.fn().mockReturnThis();
  gt = jest.fn().mockReturnThis();
  gte = jest.fn().mockReturnThis();
  lt = jest.fn().mockReturnThis();
  lte = jest.fn().mockReturnThis();
  like = jest.fn().mockReturnThis();
  ilike = jest.fn().mockReturnThis();
  is = jest.fn().mockReturnThis();
  in = jest.fn().mockReturnThis();
  contains = jest.fn().mockReturnThis();
  containedBy = jest.fn().mockReturnThis();
  
  order = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  range = jest.fn().mockReturnThis();
  single = jest.fn().mockReturnThis();
  maybeSingle = jest.fn().mockReturnThis();
  
  rpc = jest.fn().mockImplementation((_fn: string, _params?: any) => {
    return Promise.resolve({ data: 0, error: null });
  });

  then = jest.fn().mockImplementation((callback: any) => {
    if (this.shouldThrow) {
      throw new Error('Mock error');
    }
    return Promise.resolve(callback({ data: this.data, error: this.error }));
  });

  setData(data: any) {
    this.data = data;
    return this;
  }

  setError(error: any) {
    this.error = error;
    return this;
  }

  setShouldThrow(shouldThrow: boolean) {
    this.shouldThrow = shouldThrow;
    return this;
  }
}

// ============================================
// Mock Supabase Client
// ============================================

export const createMockSupabaseClient = (options: {
  comparisonData?: any;
  statsData?: any;
  dailyCostData?: any;
  error?: any;
} = {}) => {
  const {
    comparisonData = null,
    statsData = null,
    dailyCostData = null,
    error = null,
  } = options;

  return {
    from: jest.fn((table: string) => {
      const query = new MockSupabaseQueryBuilder();
      
      switch (table) {
        case 'comparisons':
          query.setData(comparisonData);
          break;
        case 'vote_stats':
          query.setData(statsData);
          break;
        case 'daily_costs':
          query.setData(dailyCostData);
          break;
        case 'rate_limits':
          query.setData(0);
          break;
        default:
          query.setData(null);
      }
      
      query.setError(error);
      return query;
    }),
    
    rpc: jest.fn((fn: string, params?: any) => {
      switch (fn) {
        case 'get_rate_limit':
          return Promise.resolve({ data: 0, error: null });
        case 'increment_rate_limit':
          return Promise.resolve({ data: 1, error: null });
        default:
          return Promise.resolve({ data: null, error: null });
      }
    }),
    
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  };
};

// ============================================
// Setup Mock for Module
// ============================================

export const setupSupabaseMock = (mockClient: any) => {
  jest.mock('@/lib/supabase', () => ({
    supabaseClient: mockClient,
    supabaseAdmin: mockClient,
    createComparison: jest.fn(),
    getComparison: jest.fn(),
    recordVote: jest.fn(),
    getVoteStats: jest.fn(),
    checkRateLimit: jest.fn(),
    incrementRateLimit: jest.fn(),
    getDailyCost: jest.fn(),
    getRecentComparisons: jest.fn(),
  }));
};

// ============================================
// Mock OpenAI Client
// ============================================

export const createMockOpenAIClient = (responseText: string = 'Mock OpenAI response') => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: responseText,
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      }),
    },
  },
});

// ============================================
// Mock Anthropic Client
// ============================================

export const createMockAnthropicClient = (responseText: string = 'Mock Anthropic response') => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
      usage: {
        input_tokens: 100,
        output_tokens: 50,
      },
    }),
  },
});

// ============================================
// Mock NextRequest
// ============================================

export const createMockNextRequest = (options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  ip?: string;
} = {}) => {
  const {
    method = 'POST',
    body = {},
    headers = {},
    ip = '127.0.0.1',
  } = options;

  const headersMap = new Map([
    ['x-forwarded-for', ip],
    ['content-type', 'application/json'],
    ...Object.entries(headers),
  ]);

  return {
    method,
    json: jest.fn().mockResolvedValue(body),
    headers: headersMap,
    ip,
  };
};
