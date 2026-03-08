import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_FLAGS } from '@/lib/config';
import { parsePlatformDestination } from '@/lib/validation';
import { validatePrompt, getClientIp, hashIp } from '@/lib/utils';
import { generateDrafts, createModelCaller } from '@/lib/generation';
import { resolveKeys } from '@/lib/key-manager';
import { evaluateDrafts, mergeEvaluations } from '@/lib/evaluator';
import { evaluateAllDraftsWithAI } from '@/lib/ai-evaluator';
import { toArenaRunPreview } from '@/lib/arena';
import { buildArenaRunData } from '@/lib/supabase';
import { createArenaRun, checkAndIncrementLimits } from '@/lib/supabase';
import { acquireGenerationSlot } from '@/lib/concurrency';
import { CreateComparisonRequest, CreateComparisonResponse } from '@/types';

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.ARENA_MVP_V2) {
    return NextResponse.json({ success: false, error: 'Arena MVP v2 is disabled' }, { status: 503 });
  }

  try {
    const body = (await request.json()) as CreateComparisonRequest;
    const { prompt } = body;
    const targetPlatform = parsePlatformDestination(body.targetPlatform);

    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const promptText = prompt.trim();
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);

    const slot = acquireGenerationSlot(ipHash);
    if (!slot.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'System is busy. Please retry in a moment.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '5',
          },
        }
      );
    }

    try {
      const limit = await checkAndIncrementLimits(ipHash);
      if (!limit.allowed) {
        const message =
          limit.remaining <= 0
            ? `Rate limit exceeded. You can make ${limit.limit} runs per day.`
            : 'Daily budget exceeded. Please try again tomorrow.';

        return NextResponse.json(
          {
            success: false,
            error: message,
            rateLimitInfo: {
              current: limit.current,
              limit: limit.limit,
              remaining: limit.remaining,
            },
          },
          { status: 429 }
        );
      }

      const keySource = body.keySource || 'platform';
      const keys = resolveKeys(keySource, body.userKeys);
      const caller = createModelCaller(keys);
      const drafts = await generateDrafts(promptText, targetPlatform, caller);

      const failedDrafts = drafts.filter((d) => d.status !== 'ok');
      if (failedDrafts.length === drafts.length) {
        return NextResponse.json(
          { success: false, error: 'All draft generations failed. Check API key configuration.' },
          { status: 503 }
        );
      }

      let evaluations = evaluateDrafts(drafts, targetPlatform);

      if (FEATURE_FLAGS.AI_EVALUATION) {
        try {
          const aiEvaluations = await evaluateAllDraftsWithAI(drafts, targetPlatform);
          evaluations = mergeEvaluations(evaluations, aiEvaluations);
        } catch {
          // AI evaluation is optional; continue with heuristic only
        }
      }

      const runData = buildArenaRunData(drafts, evaluations, targetPlatform);
      const created = await createArenaRun({
        promptText,
        ipHash,
        userAgent: request.headers.get('user-agent') || null,
        data: runData,
      });

      if (!created) {
        return NextResponse.json({ success: false, error: 'Failed to save arena run' }, { status: 500 });
      }

      const runPreview = toArenaRunPreview(created.id, created.prompt_text, runData);

      const response: CreateComparisonResponse = {
        success: true,
        run: runPreview,
        degradedCount: failedDrafts.length > 0 ? failedDrafts.length : undefined,
        rateLimitInfo: {
          current: limit.current,
          limit: limit.limit,
          remaining: limit.remaining,
        },
      };

      return NextResponse.json(response);
    } finally {
      slot.release();
    }
  } catch (error) {
    console.error('Error in comparison API:', error);
    return NextResponse.json({ success: false, error: 'Unable to generate drafts right now.' }, { status: 500 });
  }
}
