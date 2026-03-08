import {
  calculateCost,
  formatCost,
  getClientIp,
  hashIp,
  validatePrompt,
} from '@/lib/utils';

describe('utils', () => {
  it('calculates cost and formats values', () => {
    expect(calculateCost('gpt-4o-mini', 1_000_000, 1_000_000)).toBe(0.75);
    expect(formatCost(0.00001)).toBe('< $0.0001');
    expect(formatCost(0.1234)).toBe('$0.1234');
  });

  it('validates prompt boundaries', () => {
    expect(validatePrompt('').isValid).toBe(false);
    expect(validatePrompt('ab').isValid).toBe(false);
    expect(validatePrompt('abc').isValid).toBe(true);
  });

  it('reads and hashes client ip', () => {
    const request = {
      headers: new Headers({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' }),
    } as Request;

    expect(getClientIp(request)).toBe('10.0.0.1');
    expect(hashIp('10.0.0.1')).toHaveLength(64);
  });
});
