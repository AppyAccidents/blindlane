export function formatEmail(content: string): {
  formattedContent: string;
  markdown: string;
  metadata: { subjectOptions: string[]; previewText: string };
} {
  const clean = content.trim();
  const previewText = clean.slice(0, 120);
  const subjectOptions = [
    'Quick update for you',
    'A short idea worth sharing',
    'Draft for review',
  ];

  const formattedContent = [
    `Subject: ${subjectOptions[0]}`,
    `Preview: ${previewText}`,
    '',
    'Hi there,',
    '',
    clean,
    '',
    'Best,',
    'Your team',
  ].join('\n');

  return {
    formattedContent,
    markdown: formattedContent,
    metadata: {
      subjectOptions,
      previewText,
    },
  };
}
