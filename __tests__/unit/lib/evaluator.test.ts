import { evaluateDrafts } from '@/lib/evaluator';
import { DraftResult } from '@/types';

const baseDraft = (id: string, content: string): DraftResult => ({
  id,
  label: id,
  content,
  contentPreview: content.slice(0, 120),
  model: 'gpt-4o-mini',
  variant: 'concise',
  status: 'ok',
  inputTokens: 10,
  outputTokens: 20,
  tokens: 30,
  costUsd: 0.0001,
  latencyMs: 100,
});

describe('evaluateDrafts', () => {
  it('returns tags, scores and shortlist labels', () => {
    const drafts = [
      baseDraft('draft_1', 'Story opening. I learned this last week and it changed my process.'),
      baseDraft('draft_2', 'Step one, step two, step three with direct checklist format.'),
      baseDraft('draft_3', 'A concise take for quick reading with clear CTA share comment.'),
      baseDraft('draft_4', 'A concise take for quick reading with clear CTA share comment.'),
    ];

    const evaluations = evaluateDrafts(drafts, 'linkedin');

    expect(evaluations).toHaveLength(4);
    evaluations.forEach((evaluation) => {
      expect(evaluation.tags.tone).toBeDefined();
      expect(evaluation.tags.angle).toBeDefined();
      expect(evaluation.scores.clarity).toBeGreaterThanOrEqual(0);
      expect(evaluation.scores.humanFeel).toBeGreaterThanOrEqual(0);
      expect(evaluation.scores.platformFit).toBeGreaterThanOrEqual(0);
    });

    const shortlist = evaluations.filter((e) => e.shortlistLabel);
    expect(shortlist.length).toBeGreaterThanOrEqual(2);

    const dupA = evaluations.find((e) => e.draftId === 'draft_3');
    const dupB = evaluations.find((e) => e.draftId === 'draft_4');
    expect(dupA?.similarityClusterId).toEqual(dupB?.similarityClusterId);
  });
});
