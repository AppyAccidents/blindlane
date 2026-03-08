import {
  PairVoteChoice,
  PlatformDestination,
} from '@/types';

export function isPlatformDestination(value: unknown): value is PlatformDestination {
  return value === 'linkedin' || value === 'email';
}

export function parsePlatformDestination(value: unknown): PlatformDestination {
  if (isPlatformDestination(value)) {
    return value;
  }
  return 'linkedin';
}

export function isPairVoteChoice(value: unknown): value is PairVoteChoice {
  return value === 'BETTER_A' || value === 'BETTER_B' || value === 'TIE' || value === 'SKIP';
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
