import { NextRequest, NextResponse } from 'next/server';
import { getArenaRun } from '@/lib/supabase';
import { formatLinkedIn } from '@/lib/formats/linkedin';
import { formatEmail } from '@/lib/formats/email';
import { FormatRequest, FormatResponse } from '@/types';
import { isNonEmptyString, isPlatformDestination } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FormatRequest;

    if (!isNonEmptyString(body.runId)) {
      return NextResponse.json({ success: false, error: 'Missing runId' }, { status: 400 });
    }

    if (!isPlatformDestination(body.destination)) {
      return NextResponse.json({ success: false, error: 'Invalid destination' }, { status: 400 });
    }

    const arena = await getArenaRun(body.runId);
    if (!arena) {
      return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
    }

    const targetDraftId = body.draftId || arena.run.winnerDraftId;
    if (!targetDraftId) {
      return NextResponse.json({ success: false, error: 'No winner draft selected yet' }, { status: 400 });
    }

    const draft = arena.run.drafts.find((item) => item.id === targetDraftId);
    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    const formatted =
      body.destination === 'linkedin'
        ? formatLinkedIn(draft.content)
        : formatEmail(draft.content);

    const response: FormatResponse = {
      success: true,
      formattedContent: formatted.formattedContent,
      markdown: formatted.markdown,
      metadata: formatted.metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in format API:', error);
    return NextResponse.json({ success: false, error: 'Unable to format draft' }, { status: 500 });
  }
}
