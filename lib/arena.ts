import {
  ArenaRunData,
  ArenaRunPreview,
  DraftEvaluation,
  DraftResult,
} from '@/types';

export function evaluationForDraft(
  draftId: string,
  evaluations: DraftEvaluation[]
): DraftEvaluation | undefined {
  return evaluations.find((item) => item.draftId === draftId);
}

export function toArenaRunPreview(id: string, promptText: string, run: ArenaRunData): ArenaRunPreview {
  return {
    id,
    promptText,
    phase: run.phase,
    comparePairs: run.comparePairs,
    drafts: run.drafts.map((draft: DraftResult) => {
      const evaluation = evaluationForDraft(draft.id, run.evaluations);
      return {
        id: draft.id,
        label: draft.label,
        contentPreview: draft.contentPreview,
        contentFull: draft.content,
        evaluatorPreview: {
          tags: evaluation ? [evaluation.tags.tone, evaluation.tags.angle] : [],
          clarity: evaluation?.scores.clarity || 0,
          humanFeel: evaluation?.scores.humanFeel || 0,
          platformFit: evaluation?.scores.platformFit || 0,
          shortlistLabel: evaluation?.shortlistLabel,
          highlights: evaluation?.aiHighlights,
          aiSummary: evaluation?.aiSummary,
        },
      };
    }),
  };
}
