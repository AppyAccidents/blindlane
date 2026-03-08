import { NextResponse } from 'next/server';
import { getVoteStats, getDailyCost } from '@/lib/supabase';
import { DAILY_BUDGET_LIMIT, STATS_CACHE_TTL_MS } from '@/lib/config';
import { ModelStats } from '@/types';

let cachedAt = 0;
let cachedPayload: {
  stats: ModelStats[];
  totalCost: number;
} | null = null;

export const dynamic = 'force-dynamic';

function refreshCacheAsync() {
  Promise.all([getVoteStats(), getDailyCost()])
    .then(([stats, dailyCost]) => {
      cachedPayload = { stats, totalCost: dailyCost };
      cachedAt = Date.now();
    })
    .catch((error) => {
      console.error('Background stats refresh failed:', error);
    });
}

export async function GET() {
  try {
    const now = Date.now();

    // Fresh cache — serve immediately
    if (cachedPayload && now - cachedAt < STATS_CACHE_TTL_MS) {
      return buildResponse(cachedPayload.stats, cachedPayload.totalCost, true);
    }

    // Stale cache — serve stale data, refresh in background
    if (cachedPayload) {
      refreshCacheAsync();
      return buildResponse(cachedPayload.stats, cachedPayload.totalCost, true);
    }

    // No cache at all — must wait for fresh data
    const [stats, dailyCost] = await Promise.all([getVoteStats(), getDailyCost()]);

    cachedPayload = {
      stats,
      totalCost: dailyCost,
    };
    cachedAt = now;

    return buildResponse(stats, dailyCost, false);
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}

function buildResponse(stats: ModelStats[], totalCost: number, fromCache: boolean) {
  const totalComparisons = stats.reduce((sum, s) => sum + s.total_votes, 0);
  const budgetRemaining = Math.max(0, DAILY_BUDGET_LIMIT - totalCost);
  const budgetPercentUsed = DAILY_BUDGET_LIMIT > 0 ? (totalCost / DAILY_BUDGET_LIMIT) * 100 : 0;

  return NextResponse.json({
    success: true,
    stats,
    fromCache,
    summary: {
      totalComparisons,
      totalCost: Number(totalCost.toFixed(4)),
      budgetLimit: DAILY_BUDGET_LIMIT,
      budgetRemaining: Number(budgetRemaining.toFixed(4)),
      budgetPercentUsed: Number(budgetPercentUsed.toFixed(1)),
    },
  });
}
