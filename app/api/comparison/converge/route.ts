import { NextRequest, NextResponse } from 'next/server';
import { isNonEmptyString } from '@/lib/validation';
import { getArenaRun, updateArenaRun } from '@/lib/supabase';
import { convergeRun } from '@/lib/converge';
import { ConvergeRequest, ConvergeResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConvergeRequest;

    if (!isNonEmptyString(body.runId)) {
      return NextResponse.json({ success: false, error: 'Missing runId' }, { status: 400 });
    }

    if (!isNonEmptyString(body.winnerDraftId)) {
      return NextResponse.json({ success: false, error: 'Missing winnerDraftId' }, { status: 400 });
    }

    const arena = await getArenaRun(body.runId);
    if (!arena) {
      return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
    }

    if (arena.run.phase === 'converged') {
      return NextResponse.json({ success: false, error: 'Run already converged' }, { status: 409 });
    }

    const winnerExists = arena.run.drafts.some((d) => d.id === body.winnerDraftId);
    if (!winnerExists) {
      return NextResponse.json({ success: false, error: 'Winner draft not found in this run' }, { status: 400 });
    }

    const converged = convergeRun(arena.run, body.winnerDraftId);
    const updatedRun = {
      ...arena.run,
      phase: 'converged' as const,
      winnerDraftId: body.winnerDraftId,
      discardedDraftIds: converged.discardedDraftIds,
      reveal: converged.reveal,
    };

    const persisted = await updateArenaRun(body.runId, updatedRun);
    if (!persisted) {
      return NextResponse.json({ success: false, error: 'Failed to converge run' }, { status: 500 });
    }

    const response: ConvergeResponse = {
      success: true,
      workingDraft: converged.workingDraft,
      discardedDraftIds: converged.discardedDraftIds,
      reveal: converged.reveal,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in converge API:', error);
    return NextResponse.json({ success: false, error: 'Unable to converge winner' }, { status: 500 });
  }
}
