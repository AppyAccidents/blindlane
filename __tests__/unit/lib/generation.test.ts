import { generateDrafts, ModelCallResult } from '@/lib/generation';
import { selectModelsForRun, ALL_MODELS } from '@/lib/config';
import { ModelType } from '@/types';

describe('generateDrafts', () => {
  it('generates 6 drafts for 3 models x 2 variants', async () => {
    const caller = jest.fn(async (model: ModelType, prompt: string): Promise<ModelCallResult> => ({
      response: `${model}:${prompt.slice(0, 20)}`,
      inputTokens: 100,
      outputTokens: 50,
      latencyMs: 120,
      status: 'ok',
    }));

    const drafts = await generateDrafts('Test prompt', 'linkedin', caller as any, ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash']);

    expect(drafts).toHaveLength(6);
    expect(new Set(drafts.map((d) => d.label))).toEqual(new Set(['A', 'B', 'C', 'D', 'E', 'F']));
    expect(caller).toHaveBeenCalledTimes(6);
    drafts.forEach((draft) => {
      expect(draft.model).toBeDefined();
      expect(draft.variant).toBeDefined();
      expect(draft.status).toBe('ok');
      expect(draft.costUsd).toBeGreaterThan(0);
    });
  });

  it('keeps structured timeout status for failed drafts', async () => {
    const okResult = { response: 'ok', inputTokens: 80, outputTokens: 20, latencyMs: 100, status: 'ok' };
    const caller = jest
      .fn()
      .mockResolvedValueOnce(okResult)
      .mockResolvedValueOnce({ response: '', inputTokens: 80, outputTokens: 0, latencyMs: 15000, status: 'timeout' })
      .mockResolvedValueOnce({ response: '', inputTokens: 80, outputTokens: 0, latencyMs: 200, status: 'error' })
      .mockResolvedValueOnce(okResult)
      .mockResolvedValueOnce(okResult)
      .mockResolvedValueOnce(okResult);

    const drafts = await generateDrafts('Prompt', 'email', caller as any, ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash']);

    expect(drafts.filter((d) => d.status !== 'ok')).toHaveLength(2);
    expect(drafts.some((d) => d.errorReason === 'timeout')).toBe(true);
    expect(drafts.some((d) => d.errorReason === 'provider_error')).toBe(true);
  });

  it('generates correct labels for all 3 providers', async () => {
    const caller = jest.fn(async (model: ModelType): Promise<ModelCallResult> => ({
      response: `Response from ${model}`,
      inputTokens: 50,
      outputTokens: 30,
      latencyMs: 100,
      status: 'ok',
    }));

    const drafts = await generateDrafts('Test', 'linkedin', caller as any, ['gemini-2.0-flash', 'gpt-4o-mini', 'claude-3-5-haiku']);

    expect(drafts).toHaveLength(6);
    const models = new Set(drafts.map((d) => d.model));
    expect(models).toContain('gemini-2.0-flash');
    expect(models).toContain('gpt-4o-mini');
    expect(models).toContain('claude-3-5-haiku');
    expect(caller).toHaveBeenCalledTimes(6);
  });
});

describe('selectModelsForRun', () => {
  it('defaults to all 3 models', () => {
    const selected = selectModelsForRun();
    expect(selected).toHaveLength(3);
    expect(new Set(selected)).toEqual(new Set(ALL_MODELS));
  });

  it('returns the requested number of models', () => {
    const selected = selectModelsForRun(ALL_MODELS, 2);
    expect(selected).toHaveLength(2);
    selected.forEach((m) => expect(ALL_MODELS).toContain(m));
  });

  it('returns all models when count equals pool size', () => {
    const selected = selectModelsForRun(ALL_MODELS, 3);
    expect(selected).toHaveLength(3);
    expect(new Set(selected)).toEqual(new Set(ALL_MODELS));
  });

  it('never returns duplicates', () => {
    for (let i = 0; i < 20; i++) {
      const selected = selectModelsForRun(ALL_MODELS, 2);
      expect(new Set(selected).size).toBe(2);
    }
  });
});
