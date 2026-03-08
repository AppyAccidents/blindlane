import { NextRequest, NextResponse } from 'next/server';
import { getArenaRun, updateArenaRun } from '@/lib/supabase';
import { applyVoteAndRank } from '@/lib/converge';
import { isNonEmptyString, isPairVoteChoice } from '@/lib/validation';
import { VoteRequest, VoteResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VoteRequest;

    if (!isNonEmptyString(body.runId)) {
      return NextResponse.json({ success: false, error: 'Missing runId' }, { status: 400 });
    }

    if (!isNonEmptyString(body.pairId)) {
      return NextResponse.json({ success: false, error: 'Missing pairId' }, { status: 400 });
    }

    if (!isPairVoteChoice(body.vote)) {
      return NextResponse.json({ success: false, error: 'Invalid vote choice' }, { status: 400 });
    }

    const arena = await getArenaRun(body.runId);
    if (!arena) {
      return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
    }

    if (arena.run.phase === 'converged') {
      return NextResponse.json({ success: false, error: 'Run already converged' }, { status: 409 });
    }

    const alreadyVoted = arena.run.votes.some((v) => v.pairId === body.pairId);
    if (alreadyVoted) {
      return NextResponse.json({ success: false, error: 'Already voted on this pair' }, { status: 409 });
    }

    const { updatedVotes, scores } = applyVoteAndRank(arena.run, body.pairId, body.vote);
    const updatedRun = {
      ...arena.run,
      phase: 'compare' as const,
      votes: updatedVotes,
    };

    const persisted = await updateArenaRun(body.runId, updatedRun);
    if (!persisted) {
      return NextResponse.json({ success: false, error: 'Failed to persist vote' }, { status: 500 });
    }

    const response: VoteResponse = {
      success: true,
      pairId: body.pairId,
      vote: body.vote,
      aggregateSignals: {
        completedVotes: updatedVotes.length,
        totalPairs: arena.run.comparePairs.length,
        scores,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json({ success: false, error: 'Unable to record vote' }, { status: 500 });
  }
}
