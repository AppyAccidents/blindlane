describe('config constants', () => {
  it('loads defaults', async () => {
    jest.resetModules();
    const config = await import('@/lib/config');
    expect(config.RATE_LIMIT_PER_IP).toBeGreaterThan(0);
    expect(config.DAILY_BUDGET_LIMIT).toBeGreaterThan(0);
    expect(config.MAX_PROMPT_LENGTH).toBeGreaterThan(10);
    expect(config.DEFAULT_MODELS).toHaveLength(2);
    expect(config.DEFAULT_VARIANTS).toHaveLength(2);
  });
});
