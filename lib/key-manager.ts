import { ProviderType } from '@/types';

export type KeySource = 'platform' | 'user';

export interface ProviderKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export function resolveKeys(
  source: KeySource,
  userKeys?: ProviderKeys
): ProviderKeys {
  if (source === 'user' && userKeys) {
    return {
      openai: userKeys.openai || process.env.PLATFORM_OPENAI_KEY || process.env.OPENAI_API_KEY,
      anthropic: userKeys.anthropic || process.env.PLATFORM_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY,
      google: userKeys.google || process.env.PLATFORM_GOOGLE_KEY || process.env.GOOGLE_AI_API_KEY,
    };
  }

  // Platform keys (default)
  return {
    openai: process.env.PLATFORM_OPENAI_KEY || process.env.OPENAI_API_KEY,
    anthropic: process.env.PLATFORM_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY,
    google: process.env.PLATFORM_GOOGLE_KEY || process.env.GOOGLE_AI_API_KEY,
  };
}

export function getAvailableProviders(keys: ProviderKeys): ProviderType[] {
  const providers: ProviderType[] = [];
  if (keys.openai) providers.push('openai');
  if (keys.anthropic) providers.push('anthropic');
  if (keys.google) providers.push('google');
  return providers;
}
