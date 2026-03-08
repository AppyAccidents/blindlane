import { POST } from '@/app/api/comparison/vote/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  getArenaRun: jest.fn(),
  updateArenaRun: jest.fn(),
}));

import { getArenaRun, updateArenaRun } from '@/lib/supabase';

const req = (body: any) => ({ json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest);

const arena = {
  row: { id: 'run_1' },
  run: {
    phase: 'gallery',
    drafts: [
      { id: 'draft_1' },
      { id: 'draft_2' },
      { id: 'draft_3' },
      { id: 'draft_4' },
      { id: 'draft_5' },
      { id: 'draft_6' },
    ],
    evaluations: [],
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
  },
};

describe('/api/comparison/vote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getArenaRun as jest.Mock).mockResolvedValue(arena);
    (updateArenaRun as jest.Mock).mockResolvedValue({ id: 'run_1' });
  });

  it('records pair vote and returns aggregate signals', async () => {
    const response = await POST(req({ runId: 'run_1', pairId: 'pair_1', vote: 'BETTER_A' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.aggregateSignals.completedVotes).toBe(1);
    expect(data.aggregateSignals.scores.draft_1).toBeGreaterThan(0);
  });

  it('rejects invalid vote payload', async () => {
    const response = await POST(req({ runId: 'run_1', pairId: 'pair_1', vote: 'A' }));
    expect(response.status).toBe(400);
  });

  it('returns 404 for missing run', async () => {
    (getArenaRun as jest.Mock).mockResolvedValue(null);
    const response = await POST(req({ runId: 'none', pairId: 'pair_1', vote: 'SKIP' }));
    expect(response.status).toBe(404);
  });

  it('rejects vote on already-converged run', async () => {
    (getArenaRun as jest.Mock).mockResolvedValue({
      ...arena,
      run: { ...arena.run, phase: 'converged' },
    });
    const response = await POST(req({ runId: 'run_1', pairId: 'pair_1', vote: 'BETTER_A' }));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Run already converged');
  });

  it('rejects duplicate vote on same pair', async () => {
    (getArenaRun as jest.Mock).mockResolvedValue({
      ...arena,
      run: {
        ...arena.run,
        votes: [{ pairId: 'pair_1', vote: 'BETTER_A', createdAt: new Date().toISOString() }],
      },
    });
    const response = await POST(req({ runId: 'run_1', pairId: 'pair_1', vote: 'BETTER_B' }));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Already voted on this pair');
  });
});
