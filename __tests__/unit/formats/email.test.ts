import { formatEmail } from '@/lib/formats/email';

describe('formatEmail', () => {
  it('returns email structure with subject and preview', () => {
    const result = formatEmail('This is the body content for email output testing.');
    expect(result.formattedContent).toContain('Subject:');
    expect(result.formattedContent).toContain('Preview:');
    expect(result.metadata.subjectOptions).toHaveLength(3);
    expect(result.markdown).toEqual(result.formattedContent);
  });
});
