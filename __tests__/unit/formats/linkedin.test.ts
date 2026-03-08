import { formatLinkedIn } from '@/lib/formats/linkedin';

describe('formatLinkedIn', () => {
  it('returns formatted content, markdown, and metadata', () => {
    const result = formatLinkedIn('Hook line\nSecond line');
    expect(result.formattedContent).toContain('What do you think?');
    expect(result.markdown).toEqual(result.formattedContent);
    expect(result.metadata.hook).toBe('Hook line');
    expect(result.metadata.hashtags.length).toBeGreaterThan(0);
  });
});
