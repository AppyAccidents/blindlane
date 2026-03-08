import Anthropic from '@anthropic-ai/sdk';
import { DraftResult, DraftHighlight, AiEvaluation, PlatformDestination } from '@/types';
import { MODEL_REGISTRY } from '@/lib/config';

function getEvaluatorClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const EVALUATION_SYSTEM_PROMPT = `You are a content quality analyzer. Given a draft written for a specific platform, identify notable elements. Return ONLY valid JSON with this exact schema:
{
  "highlights": [
    {
      "text": "exact quoted text from the draft",
      "startIndex": <number>,
      "endIndex": <number>,
      "category": "hook" | "impact" | "cta" | "insight" | "weakness",
      "reason": "brief explanation of why this is notable"
    }
  ],
  "summary": "one sentence overall assessment",
  "strengthScore": <number 0-100>
}

Categories:
- hook: attention-grabbing openings or phrases
- impact: strongest arguments or emotional beats
- cta: calls to action
- insight: novel perspectives or data points
- weakness: areas that could be improved

Return 3-6 highlights. Ensure startIndex/endIndex match the exact character positions.`;

export async function evaluateDraftWithAI(
  draft: DraftResult,
  platform: PlatformDestination
): Promise<AiEvaluation> {
  const client = getEvaluatorClient();
  if (!client) {
    return emptyEvaluation(draft.id);
  }

  try {
    const response = await client.messages.create({
      model: MODEL_REGISTRY['claude-3-5-haiku'].apiModelId,
      max_tokens: 1024,
      temperature: 0,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Platform: ${platform}\n\nDraft content:\n${draft.content}`,
        },
      ],
    });

    const text = response.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const parsed = JSON.parse(text);
    return {
      draftId: draft.id,
      highlights: validateHighlights(parsed.highlights || [], draft.content),
      summary: parsed.summary || '',
      strengthScore: Math.max(0, Math.min(100, parsed.strengthScore || 0)),
    };
  } catch {
    return emptyEvaluation(draft.id);
  }
}

export async function evaluateAllDraftsWithAI(
  drafts: DraftResult[],
  platform: PlatformDestination
): Promise<AiEvaluation[]> {
  const results = await Promise.allSettled(
    drafts
      .filter((d) => d.status === 'ok' && d.content.length > 0)
      .map((draft) => evaluateDraftWithAI(draft, platform))
  );

  return results.map((result, index) =>
    result.status === 'fulfilled'
      ? result.value
      : emptyEvaluation(drafts[index].id)
  );
}

function emptyEvaluation(draftId: string): AiEvaluation {
  return { draftId, highlights: [], summary: '', strengthScore: 0 };
}

function validateHighlights(highlights: DraftHighlight[], content: string): DraftHighlight[] {
  return highlights
    .filter((h) => {
      if (typeof h.text !== 'string' || typeof h.startIndex !== 'number' || typeof h.endIndex !== 'number') {
        return false;
      }
      if (h.startIndex < 0 || h.endIndex > content.length || h.startIndex >= h.endIndex) {
        return false;
      }
      if (!['hook', 'impact', 'cta', 'insight', 'weakness'].includes(h.category)) {
        return false;
      }
      return true;
    })
    .map((h) => ({
      text: h.text,
      startIndex: h.startIndex,
      endIndex: h.endIndex,
      category: h.category,
      reason: h.reason || '',
    }));
}
