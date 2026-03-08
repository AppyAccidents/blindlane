import {
  AiEvaluation,
  DraftEvaluation,
  DraftResult,
  PlatformDestination,
} from '@/types';
import {
  SIMILARITY_THRESHOLD,
  CLARITY_BASE_SHORT,
  CLARITY_BASE_LONG,
  CLARITY_BASE_IDEAL,
  CLARITY_SHORT_THRESHOLD,
  CLARITY_LONG_THRESHOLD,
  HUMAN_FEEL_BASE,
  HUMAN_FEEL_CAP,
  PLATFORM_FIT_BASE_LINKEDIN,
  PLATFORM_FIT_BASE_EMAIL,
  PLATFORM_FIT_CAP,
} from '@/lib/config';

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function similarity(a: string, b: string): number {
  const setA = new Set(normalize(a));
  const setB = new Set(normalize(b));
  const intersection = [...setA].filter((v) => setB.has(v)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function scoreClarity(text: string): number {
  const length = text.length;
  if (!length) return 0;
  if (length < CLARITY_SHORT_THRESHOLD) return CLARITY_BASE_SHORT;
  if (length < CLARITY_LONG_THRESHOLD) return CLARITY_BASE_IDEAL;
  return CLARITY_BASE_LONG;
}

function scoreHumanFeel(text: string): number {
  const contractions = (text.match(/\b(i'm|we're|don't|can't|it's|you're)\b/gi) || []).length;
  const firstPerson = (text.match(/\b(i|we|our)\b/gi) || []).length;
  return Math.min(HUMAN_FEEL_CAP, HUMAN_FEEL_BASE + contractions * 3 + firstPerson * 2);
}

function scorePlatformFit(text: string, destination: PlatformDestination): number {
  if (!text) return 0;
  if (destination === 'linkedin') {
    const hasHook = /^.{1,120}[\n\.!?]/.test(text);
    const hasCta = /\b(share|comment|follow|reply|connect)\b/i.test(text);
    return Math.min(PLATFORM_FIT_CAP, PLATFORM_FIT_BASE_LINKEDIN + (hasHook ? 12 : 0) + (hasCta ? 10 : 0));
  }

  const hasSubjectTone = /\b(hello|hi|team|thanks|regards)\b/i.test(text);
  const hasStructure = /\n\n/.test(text);
  return Math.min(PLATFORM_FIT_CAP, PLATFORM_FIT_BASE_EMAIL + (hasSubjectTone ? 12 : 0) + (hasStructure ? 12 : 0));
}

function toneTag(text: string): string {
  if (/\b(amazing|excited|love|great)\b/i.test(text)) return 'enthusiastic';
  if (/\b(important|must|critical|urgent)\b/i.test(text)) return 'direct';
  return 'professional';
}

function angleTag(text: string): string {
  if (/\b(story|once|when i|last week)\b/i.test(text)) return 'story-driven';
  if (/\b(step|checklist|first|second|third)\b/i.test(text)) return 'instructional';
  return 'concise';
}

export function evaluateDrafts(
  drafts: DraftResult[],
  destination: PlatformDestination
): DraftEvaluation[] {
  const evaluations: DraftEvaluation[] = drafts.map((draft) => ({
    draftId: draft.id,
    tags: {
      tone: toneTag(draft.content),
      angle: angleTag(draft.content),
    },
    scores: {
      clarity: scoreClarity(draft.content),
      humanFeel: scoreHumanFeel(draft.content),
      platformFit: scorePlatformFit(draft.content, destination),
    },
    similarityClusterId: draft.id,
  }));

  for (let i = 0; i < drafts.length; i += 1) {
    for (let j = i + 1; j < drafts.length; j += 1) {
      if (similarity(drafts[i].content, drafts[j].content) > SIMILARITY_THRESHOLD) {
        const clusterId = `cluster_${i + 1}`;
        evaluations[i].similarityClusterId = clusterId;
        evaluations[j].similarityClusterId = clusterId;
      }
    }
  }

  const ranked = [...evaluations].sort((a, b) => {
    const scoreA = a.scores.clarity + a.scores.humanFeel + a.scores.platformFit;
    const scoreB = b.scores.clarity + b.scores.humanFeel + b.scores.platformFit;
    return scoreB - scoreA;
  });

  if (ranked[0]) {
    ranked[0].shortlistLabel = 'TOP_PICK';
  }
  if (ranked[1]) {
    ranked[1].shortlistLabel = 'RUNNER_UP';
  }

  const byId = new Map(ranked.map((ev) => [ev.draftId, ev]));
  return drafts.map((draft) => byId.get(draft.id) || evaluations.find((e) => e.draftId === draft.id)!);
}

export function mergeEvaluations(
  heuristic: DraftEvaluation[],
  ai: AiEvaluation[]
): DraftEvaluation[] {
  const aiMap = new Map(ai.map((e) => [e.draftId, e]));
  return heuristic.map((h) => {
    const aiResult = aiMap.get(h.draftId);
    if (!aiResult) return h;
    return {
      ...h,
      aiHighlights: aiResult.highlights,
      aiSummary: aiResult.summary,
    };
  });
}
