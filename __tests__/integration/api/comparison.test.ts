import { POST } from '@/app/api/comparison/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  buildArenaRunData: jest.fn((drafts, evaluations) => ({
    phase: 'gallery',
    drafts,
    evaluations,
    comparePairs: [
      { id: 'pair_1', draftAId: 'draft_1', draftBId: 'draft_2' },
      { id: 'pair_2', draftAId: 'draft_3', draftBId: 'draft_4' },
      { id: 'pair_3', draftAId: 'draft_5', draftBId: 'draft_6' },
    ],
    votes: [],
    winnerDraftId: null,
    discardedDraftIds: [],
    targetPlatform: 'linkedin',
    reveal: [],
  })),
  createArenaRun: jest.fn(),
  checkAndIncrementLimits: jest.fn(),
}));

jest.mock('@/lib/generation', () => ({
  generateDrafts: jest.fn(),
  createModelCaller: jest.fn(() => jest.fn()),
}));

jest.mock('@/lib/evaluator', () => ({
  evaluateDrafts: jest.fn(),
  mergeEvaluations: jest.fn((heuristic: any) => heuristic),
}));

jest.mock('@/lib/ai-evaluator', () => ({
  evaluateAllDraftsWithAI: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/lib/key-manager', () => ({
  resolveKeys: jest.fn(() => ({ openai: 'test', anthropic: 'test', google: 'test' })),
}));

jest.mock('@/lib/arena', () => ({
  toArenaRunPreview: jest.fn(),
}));

jest.mock('@/lib/concurrency', () => ({
  acquireGenerationSlot: jest.fn(() => ({ ok: true, release: jest.fn() })),
}));

import { checkAndIncrementLimits, createArenaRun } from '@/lib/supabase';
import { evaluateDrafts } from '@/lib/evaluator';
import { generateDrafts } from '@/lib/generation';
import { toArenaRunPreview } from '@/lib/arena';

const req = (body: any) =>
  ({
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers({ 'x-forwarded-for': '127.0.0.1', 'user-agent': 'jest' }),
  } as unknown as NextRequest);

const MODELS = ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'] as const;
const drafts = ['A', 'B', 'C', 'D', 'E', 'F'].map((label, idx) => ({
  id: `draft_${idx + 1}`,
  label,
  content: `${label} content`,
  contentPreview: `${label} content`,
  model: MODELS[Math.floor(idx / 2)],
  variant: idx % 2 === 0 ? 'concise' : 'story-driven',
  status: 'ok',
  inputTokens: 10,
  outputTokens: 20,
  tokens: 30,
  costUsd: 0.0001,
  latencyMs: 100,
}));

const evaluations = drafts.map((d: any) => ({
  draftId: d.id,
  tags: { tone: 'professional', angle: 'concise' },
  scores: { clarity: 80, humanFeel: 75, platformFit: 82 },
  similarityClusterId: d.id,
}));

describe('/api/comparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (checkAndIncrementLimits as jest.Mock).mockResolvedValue({
      allowed: true,
      current: 1,
      limit: 10,
      remaining: 9,
      dailyCost: 0,
    });
    (generateDrafts as jest.Mock).mockResolvedValue(drafts);
    (evaluateDrafts as jest.Mock).mockResolvedValue(evaluations);
    (createArenaRun as jest.Mock).mockResolvedValue({ id: 'run_1', prompt_text: 'prompt' });
    (toArenaRunPreview as jest.Mock).mockReturnValue({
      id: 'run_1',
      promptText: 'prompt',
      phase: 'gallery',
      comparePairs: [
        { id: 'pair_1', draftAId: 'draft_1', draftBId: 'draft_2' },
        { id: 'pair_2', draftAId: 'draft_3', draftBId: 'draft_4' },
        { id: 'pair_3', draftAId: 'draft_5', draftBId: 'draft_6' },
      ],
      drafts: drafts.map((d: any) => ({
        id: d.id,
        label: d.label,
        contentPreview: d.contentPreview,
        contentFull: d.content,
        evaluatorPreview: { tags: [], clarity: 80, humanFeel: 80, platformFit: 80 },
      })),
    });
  });

  it('returns run preview without model identities leakage', async () => {
    const response = await POST(req({ prompt: 'Prompt', targetPlatform: 'linkedin' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.run.drafts).toHaveLength(6);
    expect(data.run.drafts[0].contentFull).toBeDefined();
    expect(data.run.drafts[0].model).toBeUndefined();
  });

  it('rejects invalid prompt', async () => {
    const response = await POST(req({ prompt: '' }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('returns throttled response when limits fail', async () => {
    (checkAndIncrementLimits as jest.Mock).mockResolvedValue({
      allowed: false,
      current: 10,
      limit: 10,
      remaining: 0,
      dailyCost: 5,
    });

    const response = await POST(req({ prompt: 'Prompt' }));
    expect(response.status).toBe(429);
  });

  it('handles generation failures gracefully', async () => {
    (generateDrafts as jest.Mock).mockRejectedValue(new Error('provider down'));

    const response = await POST(req({ prompt: 'Prompt' }));
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error).toContain('Unable to generate drafts');
  });
});
