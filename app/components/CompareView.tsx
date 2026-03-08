'use client';

import { ArenaRunPreview, PairVoteChoice } from '@/types';
import { HighlightedContent } from '@/app/components/HighlightedContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompareViewProps {
  run: ArenaRunPreview;
  pairId: string | null;
  onVote: (vote: PairVoteChoice) => void;
  disabled?: boolean;
}

export function CompareView(props: CompareViewProps) {
  if (!props.pairId) {
    return null;
  }

  const pair = props.run.comparePairs.find((item) => item.id === props.pairId);
  if (!pair) {
    return null;
  }

  const draftA = props.run.drafts.find((draft) => draft.id === pair.draftAId);
  const draftB = props.run.drafts.find((draft) => draft.id === pair.draftBId);

  if (!draftA || !draftB) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compare: Draft {draftA.label} vs Draft {draftB.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article className="border-2 border-slate-900 dark:border-slate-800 p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Draft {draftA.label}</p>
            <HighlightedContent
              content={draftA.contentFull}
              highlights={draftA.evaluatorPreview?.highlights}
              className="max-h-48 sm:max-h-72 overflow-auto whitespace-pre-wrap text-sm"
            />
          </article>
          <article className="border-2 border-slate-900 dark:border-slate-800 p-6">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Draft {draftB.label}</p>
            <HighlightedContent
              content={draftB.contentFull}
              highlights={draftB.evaluatorPreview?.highlights}
              className="max-h-48 sm:max-h-72 overflow-auto whitespace-pre-wrap text-sm"
            />
          </article>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => props.onVote('BETTER_A')} disabled={props.disabled} aria-label={`Vote Draft ${draftA.label} as better`}>Better {draftA.label}</Button>
          <Button onClick={() => props.onVote('BETTER_B')} disabled={props.disabled} aria-label={`Vote Draft ${draftB.label} as better`}>Better {draftB.label}</Button>
          <Button onClick={() => props.onVote('TIE')} variant="outline" disabled={props.disabled}>Tie</Button>
          <Button onClick={() => props.onVote('SKIP')} variant="ghost" disabled={props.disabled}>Skip</Button>
        </div>
      </CardContent>
    </Card>
  );
}
