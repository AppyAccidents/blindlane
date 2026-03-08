import { arenaReducer, initialArenaState, ArenaState } from '@/app/arena/state';
import { ArenaRunPreview } from '@/types';

const makeDraft = (id: string, label: string) => ({
  id,
  label,
  contentPreview: label.toLowerCase(),
  contentFull: label.toLowerCase(),
  evaluatorPreview: { tags: [], clarity: 1, humanFeel: 1, platformFit: 1 },
});

const run: ArenaRunPreview = {
  id: 'run_1',
  promptText: 'prompt',
  phase: 'gallery',
  comparePairs: [
    { id: 'pair_1', draftAId: 'draft_1', draftBId: 'draft_2' },
    { id: 'pair_2', draftAId: 'draft_3', draftBId: 'draft_4' },
    { id: 'pair_3', draftAId: 'draft_5', draftBId: 'draft_6' },
  ],
  drafts: [
    makeDraft('draft_1', 'A'),
    makeDraft('draft_2', 'B'),
    makeDraft('draft_3', 'C'),
    makeDraft('draft_4', 'D'),
    makeDraft('draft_5', 'E'),
    makeDraft('draft_6', 'F'),
  ],
};

describe('arenaReducer', () => {
  it('moves through key state phases', () => {
    const generating = arenaReducer(initialArenaState, { type: 'GENERATE_START' });
    expect(generating.status).toBe('generating');

    const gallery = arenaReducer(generating, {
      type: 'GENERATE_SUCCESS',
      run,
      rateLimitInfo: { current: 1, limit: 10, remaining: 9 },
    });
    expect(gallery.status).toBe('gallery');

    const compare = arenaReducer(gallery, { type: 'SET_COMPARE_PAIR', pairId: 'pair_1' });
    expect(compare.status).toBe('compare');

    const converged = arenaReducer(compare, {
      type: 'CONVERGE_SUCCESS',
      workingDraft: { draftId: 'draft_1', content: 'winner' },
      reveal: [],
      discardedDraftIds: ['draft_2', 'draft_3', 'draft_4', 'draft_5', 'draft_6'],
    });
    expect(converged.status).toBe('converged');

    const exporting = arenaReducer(converged, { type: 'FORMAT_START' });
    expect(exporting.status).toBe('exporting');
  });

  it('stores vote progress on VOTE_SUCCESS and clears selectedComparePairId', () => {
    const gallery = arenaReducer(initialArenaState, {
      type: 'GENERATE_SUCCESS',
      run,
      rateLimitInfo: { current: 1, limit: 10, remaining: 9 },
    });
    const compare = arenaReducer(gallery, { type: 'SET_COMPARE_PAIR', pairId: 'pair_1' });
    expect(compare.selectedComparePairId).toBe('pair_1');

    const afterVote = arenaReducer(compare, {
      type: 'VOTE_SUCCESS',
      voteProgress: {
        completedVotes: 1,
        totalPairs: 3,
        scores: { draft_1: 2, draft_2: 0, draft_3: 0, draft_4: 0, draft_5: 0, draft_6: 0 },
      },
    });

    expect(afterVote.voteProgress).not.toBeNull();
    expect(afterVote.voteProgress!.completedVotes).toBe(1);
    expect(afterVote.voteProgress!.scores.draft_1).toBe(2);
    expect(afterVote.selectedComparePairId).toBeNull();
  });

  it('clears voteProgress on GENERATE_START', () => {
    const stateWithVotes: ArenaState = {
      ...initialArenaState,
      voteProgress: { completedVotes: 2, totalPairs: 2, scores: {} },
    };
    const reset = arenaReducer(stateWithVotes, { type: 'GENERATE_START' });
    expect(reset.voteProgress).toBeNull();
  });

  it('preserves prompt on RESET', () => {
    const withPrompt = arenaReducer(initialArenaState, { type: 'SET_PROMPT', prompt: 'keep me' });
    const reset = arenaReducer(withPrompt, { type: 'RESET' });
    expect(reset.prompt).toBe('keep me');
    expect(reset.status).toBe('idle');
  });
});
