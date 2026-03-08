import { evaluateDraftWithAI, evaluateAllDraftsWithAI } from '@/lib/ai-evaluator';
import { mergeEvaluations } from '@/lib/evaluator';
import { DraftResult, DraftEvaluation, AiEvaluation } from '@/types';

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              highlights: [
                {
                  text: 'attention grabber',
                  startIndex: 0,
                  endIndex: 17,
                  category: 'hook',
                  reason: 'Strong opening',
                },
              ],
              summary: 'A well-crafted draft',
              strengthScore: 78,
            }),
          },
        ],
      }),
    },
  }));
});

const makeDraft = (id: string, content: string): DraftResult => ({
  id,
  label: 'A',
  content,
  contentPreview: content.slice(0, 50),
  model: 'gpt-4o-mini',
  variant: 'concise',
  status: 'ok',
  inputTokens: 100,
  outputTokens: 50,
  tokens: 150,
  costUsd: 0.001,
  latencyMs: 200,
});

describe('evaluateDraftWithAI', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('returns structured highlights from AI response', async () => {
    const draft = makeDraft('draft_1', 'attention grabber and more content here');
    const result = await evaluateDraftWithAI(draft, 'linkedin');

    expect(result.draftId).toBe('draft_1');
    expect(result.highlights).toHaveLength(1);
    expect(result.highlights[0].category).toBe('hook');
    expect(result.summary).toBe('A well-crafted draft');
    expect(result.strengthScore).toBe(78);
  });

  it('returns empty evaluation when API key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const draft = makeDraft('draft_1', 'some content');
    const result = await evaluateDraftWithAI(draft, 'linkedin');

    expect(result.draftId).toBe('draft_1');
    expect(result.highlights).toEqual([]);
    expect(result.summary).toBe('');
  });
});

describe('evaluateAllDraftsWithAI', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('evaluates all ok drafts in parallel', async () => {
    const drafts = [
      makeDraft('draft_1', 'attention grabber and more'),
      makeDraft('draft_2', 'attention grabber and more'),
    ];
    const errorDraft = { ...makeDraft('draft_3', ''), status: 'error' as const };

    const results = await evaluateAllDraftsWithAI([...drafts, errorDraft], 'linkedin');

    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.highlights.length).toBeGreaterThanOrEqual(0));
  });
});

describe('mergeEvaluations', () => {
  it('combines heuristic and AI results', () => {
    const heuristic: DraftEvaluation[] = [
      {
        draftId: 'draft_1',
        tags: { tone: 'professional', angle: 'concise' },
        scores: { clarity: 85, humanFeel: 70, platformFit: 75 },
        similarityClusterId: 'draft_1',
      },
      {
        draftId: 'draft_2',
        tags: { tone: 'direct', angle: 'story-driven' },
        scores: { clarity: 80, humanFeel: 65, platformFit: 70 },
        similarityClusterId: 'draft_2',
      },
    ];

    const ai: AiEvaluation[] = [
      {
        draftId: 'draft_1',
        highlights: [{ text: 'hook', startIndex: 0, endIndex: 4, category: 'hook', reason: 'Good' }],
        summary: 'Solid draft',
        strengthScore: 80,
      },
    ];

    const merged = mergeEvaluations(heuristic, ai);

    expect(merged[0].aiHighlights).toHaveLength(1);
    expect(merged[0].aiSummary).toBe('Solid draft');
    expect(merged[1].aiHighlights).toBeUndefined();
  });
});
