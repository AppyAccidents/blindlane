// ============================================
// API Route: Record Vote
// POST /api/comparison/vote
// 
// Records which model the user preferred
// Then reveals which model was which
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { recordVote, getComparison } from '@/lib/supabase';
import { VoteRequest, VoteResponse, VoteResult } from '@/types';

/**
 * Main handler for POST requests
 * Called when user clicks "A is better", "B is better", or "Tie"
 */
export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // STEP 1: Parse the request
    // ==========================================
    const body: VoteRequest = await request.json();
    const { comparisonId, vote } = body;
    
    // Validate input
    if (!comparisonId) {
      return NextResponse.json(
        { success: false, error: 'Missing comparison ID' },
        { status: 400 }
      );
    }
    
    if (!vote || !['A', 'B', 'TIE'].includes(vote)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote. Must be A, B, or TIE' },
        { status: 400 }
      );
    }
    
    // ==========================================
    // STEP 2: Get the comparison (to check if already voted)
    // ==========================================
    const existingComparison = await getComparison(comparisonId);
    
    if (!existingComparison) {
      return NextResponse.json(
        { success: false, error: 'Comparison not found' },
        { status: 404 }
      );
    }
    
    // Check if already voted
    if (existingComparison.winner) {
      // Return the comparison anyway (idempotent - same result if called again)
      return NextResponse.json({
        success: true,
        comparison: existingComparison,
        message: 'Already voted',
      });
    }
    
    // ==========================================
    // STEP 3: Record the vote
    // ==========================================
    const updatedComparison = await recordVote(
      comparisonId,
      vote as VoteResult
    );
    
    if (!updatedComparison) {
      return NextResponse.json(
        { success: false, error: 'Failed to record vote' },
        { status: 500 }
      );
    }
    
    // ==========================================
    // STEP 4: Return the full comparison
    // NOW we reveal which model was A and which was B!
    // ==========================================
    return NextResponse.json({
      success: true,
      comparison: updatedComparison,
    });
    
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
