import { POST } from '@/app/api/format/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  getArenaRun: jest.fn(),
}));

import { getArenaRun } from '@/lib/supabase';

const req = (body: any) => ({ json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest);

const arenaRun = {
  row: { id: 'run_1' },
  run: {
    phase: 'converged',
    drafts: [
      { id: 'draft_1', content: 'Hook\nBody paragraph', label: 'A' },
      { id: 'draft_2', content: 'Other', label: 'B' },
    ],
    evaluations: [],
    comparePairs: [],
    votes: [],
    winnerDraftId: 'draft_1',
    discardedDraftIds: ['draft_2'],
    targetPlatform: 'linkedin',
    reveal: [],
  },
};

describe('/api/format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getArenaRun as jest.Mock).mockResolvedValue(arenaRun);
  });

  it('formats converged winner for linkedin', async () => {
    const response = await POST(req({ runId: 'run_1', destination: 'linkedin' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.formattedContent).toContain('What do you think?');
    expect(data.markdown).toBeDefined();
  });

  it('formats specific draft for email', async () => {
    const response = await POST(req({ runId: 'run_1', draftId: 'draft_1', destination: 'email' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.formattedContent).toContain('Subject:');
    expect(data.metadata.subjectOptions).toHaveLength(3);
  });
});
