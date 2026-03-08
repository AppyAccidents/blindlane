jest.mock('@/lib/supabase', () => ({
  getVoteStats: jest.fn(),
  getDailyCost: jest.fn(),
}));

import { getVoteStats, getDailyCost } from '@/lib/supabase';
import { GET } from '@/app/api/stats/route';

describe('/api/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns summary with budget calculations', async () => {
    (getVoteStats as jest.Mock).mockResolvedValue([
      { model_name: 'gpt-4o-mini', total_votes: 100, wins: 60, losses: 30, ties: 10, win_rate: 66.7 },
      { model_name: 'claude-3-5-haiku', total_votes: 100, wins: 30, losses: 60, ties: 10, win_rate: 33.3 },
    ]);
    (getDailyCost as jest.Mock).mockResolvedValue(1);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.summary.totalComparisons).toBe(200);
    expect(data.summary.totalCost).toBe(1);
  });

  it('returns cached payload on subsequent call', async () => {
    (getVoteStats as jest.Mock).mockResolvedValue([]);
    (getDailyCost as jest.Mock).mockResolvedValue(0);

    await GET();
    const second = await GET();
    const secondData = await second.json();

    expect(secondData.fromCache).toBe(true);
  });
});
