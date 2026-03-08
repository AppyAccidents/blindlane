/** @jest-environment jsdom */

import { render, screen, waitFor } from '@testing-library/react';
import LeaderboardPage from '@/app/leaderboard/page';

const originalFetch = global.fetch;

describe('LeaderboardPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('renders error state when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to the server')).toBeInTheDocument();
    });
  });

  it('renders leaderboard data state', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        stats: [
          {
            model_name: 'gpt-4o-mini',
            total_votes: 10,
            wins: 6,
            losses: 3,
            ties: 1,
            win_rate: 60,
          },
        ],
        summary: {
          totalComparisons: 12,
          totalCost: 0.12,
          budgetLimit: 10,
          budgetRemaining: 9.88,
          budgetPercentUsed: 1.2,
        },
      }),
    }) as unknown as typeof fetch;

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Model Leaderboard')).toBeInTheDocument();
      expect(screen.getAllByText('GPT-4o Mini').length).toBeGreaterThan(0);
      expect(screen.getByText('Model Performance')).toBeInTheDocument();
    });
  });
});
