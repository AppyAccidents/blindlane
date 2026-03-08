import { POST } from '@/app/api/comparison/converge/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  getArenaRun: jest.fn(),
  updateArenaRun: jest.fn(),
}));

import { getArenaRun, updateArenaRun } from '@/lib/supabase';

const req = (body: any) => ({ json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest);

const run = {
  row: { id: 'run_1' },
  run: {
    phase: 'compare',
    drafts: [
      {
        id: 'draft_1',
        label: 'A',
        content: 'winner',
        model: 'gpt-4o-mini',
        variant: 'concise',
        tokens: 30,
        costUsd: 0.0001,
        latencyMs: 100,
      },
      {
        id: 'draft_2',
        label: 'B',
        content: 'b',
        model: 'claude-3-5-haiku',
        variant: 'story-driven',
        tokens: 32,
        costUsd: 0.0002,
        latencyMs: 120,
      },
    ],
    evaluations: [],
    comparePairs: [],
    votes: [],
    winnerDraftId: null,
    discardedDraftIds: [],
    targetPlatform: 'linkedin',
    reveal: [],
  },
};

describe('/api/comparison/converge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getArenaRun as jest.Mock).mockResolvedValue(run);
    (updateArenaRun as jest.Mock).mockResolvedValue({ id: 'run_1' });
  });

  it('converges winner and returns reveal payload', async () => {
    const response = await POST(req({ runId: 'run_1', winnerDraftId: 'draft_1' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workingDraft.draftId).toBe('draft_1');
    expect(data.reveal[0].model).toBeDefined();
  });

  it('rejects invalid request', async () => {
    const response = await POST(req({ runId: 'run_1' }));
    expect(response.status).toBe(400);
  });

  it('rejects converge on already-converged run', async () => {
    (getArenaRun as jest.Mock).mockResolvedValue({
      ...run,
      run: { ...run.run, phase: 'converged' },
    });
    const response = await POST(req({ runId: 'run_1', winnerDraftId: 'draft_1' }));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Run already converged');
  });

  it('rejects converge with non-existent draft ID', async () => {
    const response = await POST(req({ runId: 'run_1', winnerDraftId: 'draft_99' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Winner draft not found in this run');
  });
});
