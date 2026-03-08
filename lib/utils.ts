import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';
import {
  MIN_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  CHARS_PER_TOKEN,
} from '@/lib/config';
import { ModelType, MODEL_PRICING } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateCost(
  model: ModelType,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}

export function formatCost(cost: number, precision: number = 4): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.0001) return '< $0.0001';
  return `$${cost.toFixed(precision)}`;
}

export function getModelDisplayName(model: ModelType): string {
  return MODEL_PRICING[model].name;
}

export function getProviderName(model: ModelType): string {
  return MODEL_PRICING[model].provider;
}

export function getProviderBorderClass(model: ModelType): string {
  const provider = MODEL_PRICING[model].provider.toLowerCase();
  return `provider-border-${provider}`;
}

export function getProviderBadgeVariant(model: ModelType): 'anthropic' | 'openai' | 'google' {
  const provider = MODEL_PRICING[model].provider.toLowerCase();
  return provider as 'anthropic' | 'openai' | 'google';
}

export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  const trimmed = (prompt || '').trim();

  if (!trimmed) {
    return { isValid: false, error: 'Please enter a prompt' };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters)`,
    };
  }

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt is too short (min ${MIN_PROMPT_LENGTH} characters)`,
    };
  }

  return { isValid: true };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function hashIp(ipAddress: string): string {
  return crypto.createHash('sha256').update(ipAddress).digest('hex');
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
