'use client';

import { DraftHighlight, HighlightCategory } from '@/types';

const HIGHLIGHT_CLASSES: Record<HighlightCategory, string> = {
  hook: 'highlight-hook',
  impact: 'highlight-impact',
  cta: 'highlight-cta',
  insight: 'highlight-insight',
  weakness: 'highlight-weakness',
};

interface HighlightedContentProps {
  content: string;
  highlights?: DraftHighlight[];
  className?: string;
}

export function HighlightedContent({ content, highlights, className }: HighlightedContentProps) {
  if (!highlights || highlights.length === 0) {
    return <p className={className}>{content}</p>;
  }

  const sorted = [...highlights]
    .filter((h) => h.startIndex >= 0 && h.endIndex <= content.length && h.startIndex < h.endIndex)
    .sort((a, b) => a.startIndex - b.startIndex);

  const segments: React.ReactNode[] = [];
  let cursor = 0;

  for (const highlight of sorted) {
    if (highlight.startIndex < cursor) continue;

    if (highlight.startIndex > cursor) {
      segments.push(content.slice(cursor, highlight.startIndex));
    }

    segments.push(
      <span
        key={`${highlight.startIndex}-${highlight.endIndex}`}
        className={`${HIGHLIGHT_CLASSES[highlight.category]} px-0.5`}
        title={`${highlight.category}: ${highlight.reason}`}
      >
        {content.slice(highlight.startIndex, highlight.endIndex)}
      </span>
    );

    cursor = highlight.endIndex;
  }

  if (cursor < content.length) {
    segments.push(content.slice(cursor));
  }

  return <p className={className}>{segments}</p>;
}

const LEGEND_ITEMS: { category: HighlightCategory; label: string }[] = [
  { category: 'hook', label: 'Hook' },
  { category: 'impact', label: 'Impact' },
  { category: 'cta', label: 'CTA' },
  { category: 'insight', label: 'Insight' },
  { category: 'weakness', label: 'Weakness' },
];

export function HighlightLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
      <span>Highlights:</span>
      {LEGEND_ITEMS.map(({ category, label }) => (
        <span key={category} className={`${HIGHLIGHT_CLASSES[category]} px-1.5 py-0.5`}>
          {label}
        </span>
      ))}
    </div>
  );
}
