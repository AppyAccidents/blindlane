import 'openai/shims/node';

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  API_TIMEOUT_MS,
  DEFAULT_VARIANTS,
  MAX_RESPONSE_TOKENS,
  MODEL_REGISTRY,
  selectModelsForRun,
} from '@/lib/config';
import {
  DraftResult,
  ModelType,
  PlatformDestination,
  VariantType,
} from '@/types';
import { calculateCost, estimateTokenCount, truncate } from '@/lib/utils';
import { ProviderKeys } from '@/lib/key-manager';

export interface ModelCallResult {
  response: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: 'ok' | 'timeout' | 'error';
}

export type ModelCaller = (
  model: ModelType,
  prompt: string,
  timeoutMs: number
) => Promise<ModelCallResult>;

const VARIANT_INSTRUCTIONS: Record<VariantType, string> = {
  concise: 'Write direct, concise, actionable copy. Avoid filler.',
  'story-driven': 'Write with a narrative opening and clear emotional arc.',
};

function buildVariantPrompt(prompt: string, variant: VariantType, platform: PlatformDestination): string {
  return [
    `Target platform: ${platform}.`,
    VARIANT_INSTRUCTIONS[variant],
    `User prompt: ${prompt}`,
  ].join('\n');
}

function getOpenAIClient(apiKey?: string) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function getAnthropicClient(apiKey?: string) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

function getGoogleClient(apiKey?: string) {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function errorResult(prompt: string, started: number): ModelCallResult {
  return {
    response: '',
    inputTokens: estimateTokenCount(prompt),
    outputTokens: 0,
    latencyMs: Date.now() - started,
    status: 'error',
  };
}

export async function defaultModelCaller(
  model: ModelType,
  prompt: string,
  timeoutMs: number
): Promise<ModelCallResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const { provider, apiModelId } = MODEL_REGISTRY[model];

    switch (provider) {
      case 'openai': {
        const openai = getOpenAIClient();
        if (!openai) return errorResult(prompt, started);

        const response = await openai.chat.completions.create(
          {
            model: apiModelId,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: MAX_RESPONSE_TOKENS,
            temperature: 0.7,
          },
          { signal: controller.signal }
        );

        const content = response.choices[0]?.message?.content || '';
        return {
          response: content,
          inputTokens: response.usage?.prompt_tokens || estimateTokenCount(prompt),
          outputTokens: response.usage?.completion_tokens || estimateTokenCount(content),
          latencyMs: Date.now() - started,
          status: 'ok',
        };
      }

      case 'anthropic': {
        const anthropic = getAnthropicClient();
        if (!anthropic) return errorResult(prompt, started);

        const response = await anthropic.messages.create(
          {
            model: apiModelId,
            max_tokens: MAX_RESPONSE_TOKENS,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }],
          },
          { signal: controller.signal }
        );

        const content = response.content
          .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
          .map((block) => block.text)
          .join('');

        return {
          response: content,
          inputTokens: response.usage?.input_tokens || estimateTokenCount(prompt),
          outputTokens: response.usage?.output_tokens || estimateTokenCount(content),
          latencyMs: Date.now() - started,
          status: 'ok',
        };
      }

      case 'google': {
        const google = getGoogleClient();
        if (!google) return errorResult(prompt, started);

        const genModel = google.getGenerativeModel({ model: apiModelId });
        const result = await Promise.race([
          genModel.generateContent(prompt),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError'))
            );
          }),
        ]);

        const content = result.response.text();
        const usage = result.response.usageMetadata;
        return {
          response: content,
          inputTokens: usage?.promptTokenCount || estimateTokenCount(prompt),
          outputTokens: usage?.candidatesTokenCount || estimateTokenCount(content),
          latencyMs: Date.now() - started,
          status: 'ok',
        };
      }

      default: {
        const _exhaustive: never = provider;
        return errorResult(prompt, started);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        response: '',
        inputTokens: estimateTokenCount(prompt),
        outputTokens: 0,
        latencyMs: timeoutMs,
        status: 'timeout',
      };
    }

    return {
      response: '',
      inputTokens: estimateTokenCount(prompt),
      outputTokens: 0,
      latencyMs: Date.now() - started,
      status: 'error',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createModelCaller(keys: ProviderKeys): ModelCaller {
  return async (model, prompt, timeoutMs) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const started = Date.now();

    try {
      const { provider, apiModelId } = MODEL_REGISTRY[model];

      switch (provider) {
        case 'openai': {
          const openai = getOpenAIClient(keys.openai);
          if (!openai) return errorResult(prompt, started);

          const response = await openai.chat.completions.create(
            { model: apiModelId, messages: [{ role: 'user', content: prompt }], max_tokens: MAX_RESPONSE_TOKENS, temperature: 0.7 },
            { signal: controller.signal }
          );
          const content = response.choices[0]?.message?.content || '';
          return { response: content, inputTokens: response.usage?.prompt_tokens || estimateTokenCount(prompt), outputTokens: response.usage?.completion_tokens || estimateTokenCount(content), latencyMs: Date.now() - started, status: 'ok' };
        }
        case 'anthropic': {
          const anthropic = getAnthropicClient(keys.anthropic);
          if (!anthropic) return errorResult(prompt, started);

          const response = await anthropic.messages.create(
            { model: apiModelId, max_tokens: MAX_RESPONSE_TOKENS, temperature: 0.7, messages: [{ role: 'user', content: prompt }] },
            { signal: controller.signal }
          );
          const content = response.content.filter((block): block is { type: 'text'; text: string } => block.type === 'text').map((block) => block.text).join('');
          return { response: content, inputTokens: response.usage?.input_tokens || estimateTokenCount(prompt), outputTokens: response.usage?.output_tokens || estimateTokenCount(content), latencyMs: Date.now() - started, status: 'ok' };
        }
        case 'google': {
          const google = getGoogleClient(keys.google);
          if (!google) return errorResult(prompt, started);

          const genModel = google.getGenerativeModel({ model: apiModelId });
          const result = await Promise.race([
            genModel.generateContent(prompt),
            new Promise<never>((_, reject) => { controller.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))); }),
          ]);
          const content = result.response.text();
          const usage = result.response.usageMetadata;
          return { response: content, inputTokens: usage?.promptTokenCount || estimateTokenCount(prompt), outputTokens: usage?.candidatesTokenCount || estimateTokenCount(content), latencyMs: Date.now() - started, status: 'ok' };
        }
        default: {
          const _exhaustive: never = provider;
          return errorResult(prompt, started);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { response: '', inputTokens: estimateTokenCount(prompt), outputTokens: 0, latencyMs: timeoutMs, status: 'timeout' };
      }
      return { response: '', inputTokens: estimateTokenCount(prompt), outputTokens: 0, latencyMs: Date.now() - started, status: 'error' };
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

function draftLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export async function generateDrafts(
  prompt: string,
  targetPlatform: PlatformDestination,
  modelCaller: ModelCaller = defaultModelCaller,
  models?: ModelType[]
): Promise<DraftResult[]> {
  const selectedModels = models || selectModelsForRun();
  const jobs = selectedModels.flatMap((model) =>
    DEFAULT_VARIANTS.map((variant) => ({ model, variant }))
  );

  const settled = await Promise.all(
    jobs.map(async ({ model, variant }, index) => {
      const promptWithVariant = buildVariantPrompt(prompt, variant, targetPlatform);
      const result = await modelCaller(model, promptWithVariant, API_TIMEOUT_MS);
      const content = result.status === 'ok' ? result.response : '';
      const costUsd = calculateCost(model, result.inputTokens, result.outputTokens);

      return {
        id: `draft_${index + 1}`,
        label: draftLabel(index),
        content,
        contentPreview: truncate(content || '[Draft unavailable]', 160),
        model,
        variant,
        status: result.status,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        tokens: result.inputTokens + result.outputTokens,
        costUsd,
        latencyMs: result.latencyMs,
        errorReason: result.status === 'ok' ? undefined : result.status === 'timeout' ? 'timeout' : 'provider_error',
      } as DraftResult;
    })
  );

  return settled;
}
