import {
  ArenaRunPreview,
  PairVoteChoice,
  PlatformDestination,
  RevealItem,
  RunPhase,
} from '@/types';

export type ArenaStatus = 'idle' | 'generating' | 'gallery' | 'compare' | 'converged' | 'exporting';

export interface VoteProgress {
  completedVotes: number;
  totalPairs: number;
  scores: Record<string, number>;
}

export interface ArenaState {
  status: ArenaStatus;
  run: ArenaRunPreview | null;
  prompt: string;
  targetPlatform: PlatformDestination;
  selectedComparePairId: string | null;
  workingDraft: { draftId: string; content: string } | null;
  reveal: RevealItem[];
  discardedDraftIds: string[];
  error: string | null;
  voteProgress: VoteProgress | null;
  rateLimitInfo: {
    current: number;
    limit: number;
    remaining: number;
  } | null;
  formattedOutput: {
    destination: PlatformDestination;
    formattedContent: string;
    markdown: string;
    metadata?: Record<string, string | string[]>;
  } | null;
}

export type ArenaAction =
  | { type: 'SET_PROMPT'; prompt: string }
  | { type: 'SET_TARGET_PLATFORM'; targetPlatform: PlatformDestination }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; run: ArenaRunPreview; rateLimitInfo: ArenaState['rateLimitInfo'] }
  | { type: 'GENERATE_ERROR'; error: string }
  | { type: 'SET_COMPARE_PAIR'; pairId: string }
  | { type: 'VOTE_SUCCESS'; voteProgress: VoteProgress }
  | {
      type: 'CONVERGE_SUCCESS';
      workingDraft: { draftId: string; content: string };
      reveal: RevealItem[];
      discardedDraftIds: string[];
    }
  | {
      type: 'FORMAT_SUCCESS';
      output: {
        destination: PlatformDestination;
        formattedContent: string;
        markdown: string;
        metadata?: Record<string, string | string[]>;
      };
    }
  | { type: 'FORMAT_START' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export const initialArenaState: ArenaState = {
  status: 'idle',
  run: null,
  prompt: '',
  targetPlatform: 'linkedin',
  selectedComparePairId: null,
  workingDraft: null,
  reveal: [],
  discardedDraftIds: [],
  error: null,
  voteProgress: null,
  rateLimitInfo: null,
  formattedOutput: null,
};

export function arenaReducer(state: ArenaState, action: ArenaAction): ArenaState {
  switch (action.type) {
    case 'SET_PROMPT':
      return { ...state, prompt: action.prompt };
    case 'SET_TARGET_PLATFORM':
      return { ...state, targetPlatform: action.targetPlatform };
    case 'GENERATE_START':
      return {
        ...state,
        status: 'generating',
        error: null,
        run: null,
        selectedComparePairId: null,
        workingDraft: null,
        reveal: [],
        discardedDraftIds: [],
        voteProgress: null,
        formattedOutput: null,
      };
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        status: 'gallery',
        run: action.run,
        rateLimitInfo: action.rateLimitInfo,
      };
    case 'GENERATE_ERROR':
      return {
        ...state,
        status: 'idle',
        error: action.error,
      };
    case 'SET_COMPARE_PAIR':
      return {
        ...state,
        status: 'compare',
        selectedComparePairId: action.pairId,
      };
    case 'VOTE_SUCCESS':
      return {
        ...state,
        voteProgress: action.voteProgress,
        selectedComparePairId: null,
      };
    case 'CONVERGE_SUCCESS':
      return {
        ...state,
        status: 'converged',
        workingDraft: action.workingDraft,
        reveal: action.reveal,
        discardedDraftIds: action.discardedDraftIds,
      };
    case 'FORMAT_START':
      return { ...state, status: 'exporting' };
    case 'FORMAT_SUCCESS':
      return {
        ...state,
        status: 'converged',
        formattedOutput: action.output,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return {
        ...initialArenaState,
        prompt: state.prompt,
      };
    default:
      return state;
  }
}

export function isRunPhaseVisible(phase: RunPhase, stateStatus: ArenaStatus): boolean {
  if (phase === 'converged') {
    return stateStatus === 'converged' || stateStatus === 'exporting';
  }
  return true;
}
