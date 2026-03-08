import { MODEL_PRICING } from '@/types';

describe('types pricing', () => {
  it('contains pricing for supported models', () => {
    expect(MODEL_PRICING['gpt-4o-mini'].input).toBeGreaterThan(0);
    expect(MODEL_PRICING['claude-3-5-haiku'].output).toBeGreaterThan(0);
  });
});
