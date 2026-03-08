export function formatLinkedIn(content: string): {
  formattedContent: string;
  markdown: string;
  metadata: { hook: string; cta: string; hashtags: string[] };
} {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  const hook = lines[0] || 'Quick insight:';
  const cta = 'What do you think? Share your take in the comments.';
  const hashtags = ['#content', '#writing', '#marketing'];

  const formattedContent = [
    hook,
    '',
    ...lines.slice(1),
    '',
    cta,
    '',
    hashtags.join(' '),
  ].join('\n');

  return {
    formattedContent,
    markdown: formattedContent,
    metadata: {
      hook,
      cta,
      hashtags,
    },
  };
}
