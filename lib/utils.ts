// ============================================
// Utility Functions
// Helper functions used throughout the app
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ModelType, MODEL_PRICING } from '@/types';

/**
 * Combines Tailwind classes with proper precedence
 * This is a common pattern in modern React apps
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Randomly shuffles which model is A and which is B
 * This is the "blind" part of BlindLane!
 * 
 * Returns: [modelForA, modelForB]
 */
export function randomizeModels(): [ModelType, ModelType] {
  const models: ModelType[] = ['gpt-4o-mini', 'claude-3-5-haiku'];
  
  // 50/50 chance of which order
  if (Math.random() < 0.5) {
    return [models[0], models[1]];
  } else {
    return [models[1], models[0]];
  }
}

/**
 * Calculates the cost of an API call based on token usage
 * 
 * @param model - Which model was used
 * @param inputTokens - Number of input tokens (your prompt)
 * @param outputTokens - Number of output tokens (the response)
 * @returns Cost in USD
 */
export function calculateCost(
  model: ModelType,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  
  // Cost = (tokens / 1,000,000) * price_per_1m
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  // Round to 6 decimal places for display
  return Number((inputCost + outputCost).toFixed(6));
}

/**
 * Formats a cost for display
 * 
 * @param cost - Cost in USD
 * @returns Formatted string like "$0.0012" or "< $0.0001" for very small amounts
 */
export function formatCost(cost: number): string {
  if (cost < 0.0001) {
    return '< $0.0001';
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Gets a readable model name
 */
export function getModelDisplayName(model: ModelType): string {
  return MODEL_PRICING[model].name;
}

/**
 * Gets the provider name
 */
export function getProviderName(model: ModelType): string {
  return MODEL_PRICING[model].provider;
}

/**
 * Validates a prompt
 * 
 * @param prompt - The user's prompt
 * @returns Object with isValid and error message
 */
export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  const trimmed = prompt.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a prompt' };
  }
  
  if (trimmed.length > 1000) {
    return { isValid: false, error: 'Prompt is too long (max 1000 characters)' };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Prompt is too short (min 3 characters)' };
  }
  
  return { isValid: true };
}

/**
 * Formats a date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncates text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Gets the client IP address from request headers
 * This is used for rate limiting
 */
export function getClientIp(request: Request): string {
  // Try various headers that might contain the IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback - in production this won't be accurate
  // In Vercel, use the x-forwarded-for header
  return 'unknown';
}

/**
 * Delay function for testing/animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Counts tokens roughly (very approximate)
 * OpenAI and Anthropic use different tokenizers, but as a rough estimate:
 * ~4 characters = 1 token for English text
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
