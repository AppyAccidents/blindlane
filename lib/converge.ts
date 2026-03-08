import {
  ArenaRunData,
  DraftResult,
  PairVoteChoice,
  RevealItem,
  VoteEvent,
} from '@/types';
import { VOTE_WEIGHT_WINNER, VOTE_WEIGHT_TIE } from '@/lib/config';

export function buildInitialPairs(drafts: DraftResult[]) {
  if (drafts.length < 2) {
    return [];
  }

  const pairs = [];
  for (let i = 0; i + 1 < drafts.length; i += 2) {
    pairs.push({
      id: `pair_${pairs.length + 1}`,
      draftAId: drafts[i].id,
      draftBId: drafts[i + 1].id,
    });
  }
  return pairs;
}

export function applyVoteAndRank(
  run: ArenaRunData,
  pairId: string,
  vote: PairVoteChoice
): {
  updatedVotes: VoteEvent[];
  scores: Record<string, number>;
} {
  const pair = run.comparePairs.find((item) => item.id === pairId);
  if (!pair) {
    throw new Error('Unknown pair');
  }

  const updatedVotes = [
    ...run.votes,
    {
      pairId,
      vote,
      createdAt: new Date().toISOString(),
    },
  ];

  const scores: Record<string, number> = {};
  for (const draft of run.drafts) {
    scores[draft.id] = 0;
  }

  for (const event of updatedVotes) {
    const targetPair = run.comparePairs.find((item) => item.id === event.pairId);
    if (!targetPair) continue;

    if (event.vote === 'BETTER_A') {
      scores[targetPair.draftAId] += VOTE_WEIGHT_WINNER;
    } else if (event.vote === 'BETTER_B') {
      scores[targetPair.draftBId] += VOTE_WEIGHT_WINNER;
    } else if (event.vote === 'TIE') {
      scores[targetPair.draftAId] += VOTE_WEIGHT_TIE;
      scores[targetPair.draftBId] += VOTE_WEIGHT_TIE;
    }
  }

  return { updatedVotes, scores };
}

export function convergeRun(run: ArenaRunData, winnerDraftId: string): {
  workingDraft: { draftId: string; content: string };
  discardedDraftIds: string[];
  reveal: RevealItem[];
} {
  const winner = run.drafts.find((draft) => draft.id === winnerDraftId);
  if (!winner) {
    throw new Error('Winner draft not found');
  }

  const discardedDraftIds = run.drafts
    .filter((draft) => draft.id !== winnerDraftId)
    .map((draft) => draft.id);

  const reveal: RevealItem[] = run.drafts.map((draft) => ({
    draftId: draft.id,
    model: draft.model,
    variant: draft.variant,
    cost: draft.costUsd,
    latency: draft.latencyMs,
    tokens: draft.tokens,
  }));

  return {
    workingDraft: {
      draftId: winner.id,
      content: winner.content,
    },
    discardedDraftIds,
    reveal,
  };
}
