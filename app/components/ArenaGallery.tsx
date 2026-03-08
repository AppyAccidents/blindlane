'use client';

import { useState } from 'react';
import { ArenaRunPreview, RevealItem } from '@/types';
import { getProviderBorderClass, getProviderBadgeVariant, getProviderName } from '@/lib/utils';
import { HighlightedContent, HighlightLegend } from '@/app/components/HighlightedContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ArenaGalleryProps {
  run: ArenaRunPreview;
  onSelectPair: (pairId: string) => void;
  onConverge: (draftId: string) => void;
  isConverged: boolean;
  discardedDraftIds: string[];
  disabled?: boolean;
  reveal?: RevealItem[];
}

export function ArenaGallery(props: ArenaGalleryProps) {
  const [convergeDraftId, setConvergeDraftId] = useState<string | null>(null);

  const revealMap = new Map(
    (props.reveal || []).map((r) => [r.draftId, r])
  );
  const hasHighlights = props.run.drafts.some(
    (d) => d.evaluatorPreview.highlights && d.evaluatorPreview.highlights.length > 0
  );

  const convergeDraft = convergeDraftId
    ? props.run.drafts.find((d) => d.id === convergeDraftId)
    : null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Arena</p>
          <h2 className="font-serif text-2xl font-black uppercase tracking-tight">Arena Gallery</h2>
        </div>
        <Badge variant="secondary">{props.isConverged ? 'Revealed' : 'Anonymous Drafts'}</Badge>
      </div>

      {hasHighlights && <HighlightLegend />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {props.run.drafts.map((draft) => {
          const isDiscarded = props.discardedDraftIds.includes(draft.id);
          const revealItem = revealMap.get(draft.id);
          const providerBorder = props.isConverged && revealItem
            ? getProviderBorderClass(revealItem.model)
            : '';

          return (
            <Card key={draft.id} className={`group transition-shadow hover:shadow-md ${isDiscarded ? 'opacity-50' : ''} ${providerBorder}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Draft {draft.label}</CardTitle>
                  <div className="flex items-center gap-1">
                    {props.isConverged && revealItem && (
                      <Badge variant={getProviderBadgeVariant(revealItem.model)}>
                        {getProviderName(revealItem.model)}
                      </Badge>
                    )}
                    {draft.evaluatorPreview.shortlistLabel && (
                      <Badge variant={draft.evaluatorPreview.shortlistLabel === 'TOP_PICK' ? 'hook' : 'impact'}>
                        {draft.evaluatorPreview.shortlistLabel === 'TOP_PICK' ? 'Top pick' : 'Runner-up'}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {draft.evaluatorPreview.tags.join(' · ') || 'No tags'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <HighlightedContent
                  content={draft.contentPreview}
                  highlights={draft.evaluatorPreview.highlights}
                  className="line-clamp-6 whitespace-pre-wrap font-serif text-base italic leading-relaxed text-foreground"
                />
                {!props.isConverged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConvergeDraftId(draft.id)}
                    disabled={props.disabled}
                    aria-label={`Converge Draft ${draft.label} as winner`}
                  >
                    Converge Winner
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!props.isConverged && (
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            {props.run.comparePairs.map((pair) => (
              <Button key={pair.id} onClick={() => props.onSelectPair(pair.id)} variant="secondary" size="sm">
                Compare {pair.id.replace('pair_', 'Pair ')}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!convergeDraftId} onOpenChange={(open) => { if (!open) setConvergeDraftId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converge this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              {convergeDraft
                ? `Draft ${convergeDraft.label} will become your working draft. The other 5 drafts will be discarded. This action cannot be undone.`
                : 'The other drafts will be discarded. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (convergeDraftId) { props.onConverge(convergeDraftId); setConvergeDraftId(null); } }}>
              Converge
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
