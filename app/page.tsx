'use client';

import { useReducer, useState } from 'react';
import { EditorPanel, KeySourceType, UserKeys } from '@/app/components/EditorPanel';
import { ArenaGallery } from '@/app/components/ArenaGallery';
import { CompareView } from '@/app/components/CompareView';
import { RevealPanel } from '@/app/components/RevealPanel';
import { ExportPanel } from '@/app/components/ExportPanel';
import { arenaReducer, initialArenaState } from '@/app/arena/state';
import {
  ConvergeResponse,
  CreateComparisonResponse,
  FormatResponse,
  PairVoteChoice,
  PlatformDestination,
  VoteResponse,
} from '@/types';
import { X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [state, dispatch] = useReducer(arenaReducer, initialArenaState);
  const [isVoting, setIsVoting] = useState(false);
  const [isConverging, setIsConverging] = useState(false);
  const [keySource, setKeySource] = useState<KeySourceType>('platform');
  const [userKeys, setUserKeys] = useState<UserKeys>({ openai: '', anthropic: '', google: '' });

  const isBusy = state.status === 'generating' || isVoting || isConverging;

  const generate = async () => {
    dispatch({ type: 'GENERATE_START' });
    try {
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: state.prompt,
          targetPlatform: state.targetPlatform,
          keySource,
          userKeys: keySource === 'user' ? userKeys : undefined,
        }),
      });
      const data = (await response.json()) as CreateComparisonResponse;

      if (!data.success || !data.run) {
        dispatch({ type: 'GENERATE_ERROR', error: data.error || 'Failed to generate drafts' });
        return;
      }

      dispatch({ type: 'GENERATE_SUCCESS', run: data.run, rateLimitInfo: data.rateLimitInfo || null });
    } catch {
      dispatch({ type: 'GENERATE_ERROR', error: 'Unable to generate drafts right now.' });
    }
  };

  const vote = async (voteChoice: PairVoteChoice) => {
    if (!state.run || !state.selectedComparePairId || isVoting) return;
    setIsVoting(true);

    try {
      const response = await fetch('/api/comparison/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: state.run.id,
          pairId: state.selectedComparePairId,
          vote: voteChoice,
        }),
      });

      const data = (await response.json()) as VoteResponse;
      if (!data.success) {
        dispatch({ type: 'GENERATE_ERROR', error: data.error || 'Vote failed' });
        return;
      }

      if (data.aggregateSignals) {
        dispatch({
          type: 'VOTE_SUCCESS',
          voteProgress: {
            completedVotes: data.aggregateSignals.completedVotes,
            totalPairs: data.aggregateSignals.totalPairs,
            scores: data.aggregateSignals.scores,
          },
        });
      }
    } catch {
      dispatch({ type: 'GENERATE_ERROR', error: 'Unable to record vote right now.' });
    } finally {
      setIsVoting(false);
    }
  };

  const converge = async (draftId: string) => {
    if (!state.run || isConverging) return;
    setIsConverging(true);

    try {
      const response = await fetch('/api/comparison/converge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: state.run.id, winnerDraftId: draftId }),
      });

      const data = (await response.json()) as ConvergeResponse;
      if (!data.success || !data.workingDraft || !data.reveal || !data.discardedDraftIds) {
        dispatch({ type: 'GENERATE_ERROR', error: data.error || 'Converge failed' });
        return;
      }

      dispatch({
        type: 'CONVERGE_SUCCESS',
        workingDraft: data.workingDraft,
        reveal: data.reveal,
        discardedDraftIds: data.discardedDraftIds,
      });
    } catch {
      dispatch({ type: 'GENERATE_ERROR', error: 'Unable to converge winner right now.' });
    } finally {
      setIsConverging(false);
    }
  };

  const exportDraft = async (destination: PlatformDestination) => {
    if (!state.run || !state.workingDraft) return;

    dispatch({ type: 'FORMAT_START' });
    try {
      const response = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: state.run.id,
          draftId: state.workingDraft.draftId,
          destination,
        }),
      });

      const data = (await response.json()) as FormatResponse;
      if (!data.success || !data.formattedContent || !data.markdown) {
        dispatch({ type: 'GENERATE_ERROR', error: data.error || 'Formatting failed' });
        return;
      }

      dispatch({
        type: 'FORMAT_SUCCESS',
        output: {
          destination,
          formattedContent: data.formattedContent,
          markdown: data.markdown,
          metadata: data.metadata,
        },
      });
    } catch {
      dispatch({ type: 'GENERATE_ERROR', error: 'Unable to format draft right now.' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-4xl font-black tracking-tight uppercase">Workspace</h1>
          <p className="font-sans text-sm text-muted-foreground">Editor-first Arena flow for blind draft selection and export.</p>
        </div>
        <div className="flex items-center gap-2">
          {state.rateLimitInfo ? (
            <Badge variant="secondary">
              Remaining: {state.rateLimitInfo.remaining}/{state.rateLimitInfo.limit}
            </Badge>
          ) : null}
          {state.status !== 'idle' && <Badge>{state.status.toUpperCase()}</Badge>}
        </div>
      </header>

      {state.error ? (
        <Alert variant="destructive" className="relative">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <main className="space-y-4">
          <EditorPanel
            prompt={state.prompt}
            targetPlatform={state.targetPlatform}
            onPromptChange={(value) => dispatch({ type: 'SET_PROMPT', prompt: value })}
            onTargetPlatformChange={(value) => dispatch({ type: 'SET_TARGET_PLATFORM', targetPlatform: value })}
            onGenerate={generate}
            isGenerating={state.status === 'generating'}
            workingDraft={state.workingDraft}
            keySource={keySource}
            onKeySourceChange={setKeySource}
            userKeys={userKeys}
            onUserKeysChange={setUserKeys}
          />

          {state.status === 'generating' ? <GeneratingSkeleton /> : null}
          {state.status === 'converged' ? <ExportPanel onExport={exportDraft} output={state.formattedOutput} /> : null}
        </main>

        <section className="space-y-4">
          {state.run ? (
            <>
              <ArenaGallery
                run={state.run}
                onSelectPair={(pairId) => dispatch({ type: 'SET_COMPARE_PAIR', pairId })}
                onConverge={converge}
                isConverged={state.status === 'converged' || state.status === 'exporting'}
                discardedDraftIds={state.discardedDraftIds}
                disabled={isBusy}
                reveal={state.reveal}
              />
              {state.voteProgress && state.reveal.length === 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Voting progress</span>
                    <span>{state.voteProgress.completedVotes}/{state.voteProgress.totalPairs} pairs</span>
                  </div>
                  <div className="h-1.5 bg-muted">
                    <div
                      className="h-1.5 bg-primary transition-all"
                      style={{ width: `${(state.voteProgress.completedVotes / state.voteProgress.totalPairs) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <CompareView run={state.run} pairId={state.selectedComparePairId} onVote={vote} disabled={isBusy} />
              <RevealPanel reveal={state.reveal} />
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Arena drafts will appear here after generation.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function GeneratingSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
