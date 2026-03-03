// ============================================
// API Route: Get Stats
// GET /api/stats
// 
// Returns voting statistics for the leaderboard
// Shows which model is winning overall
// ============================================

import { NextResponse } from 'next/server';
import { getVoteStats, getDailyCost } from '@/lib/supabase';
import { DAILY_BUDGET_LIMIT } from '@/lib/constants';

// Force dynamic rendering - don't cache stats
export const dynamic = 'force-dynamic';

/**
 * Main handler for GET requests
 */
export async function GET() {
  try {
    // ==========================================
    // Get stats from database
    // ==========================================
    const [stats, dailyCost] = await Promise.all([
      getVoteStats(),
      getDailyCost(),
    ]);
    
    // Calculate totals
    const totalComparisons = stats.reduce((sum, s) => sum + s.total_votes, 0);
    const totalCost = dailyCost;
    
    // Budget remaining
    const budgetRemaining = Math.max(0, DAILY_BUDGET_LIMIT - totalCost);
    const budgetPercentUsed = (totalCost / DAILY_BUDGET_LIMIT) * 100;
    
    return NextResponse.json({
      success: true,
      stats,
      summary: {
        totalComparisons,
        totalCost: Number(totalCost.toFixed(4)),
        budgetLimit: DAILY_BUDGET_LIMIT,
        budgetRemaining: Number(budgetRemaining.toFixed(4)),
        budgetPercentUsed: Number(budgetPercentUsed.toFixed(1)),
      },
    });
    
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
