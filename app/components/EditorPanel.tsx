'use client';

import { useState } from 'react';
import { Sparkles, Settings, Key } from 'lucide-react';
import { PlatformDestination } from '@/types';
import { MAX_PROMPT_LENGTH } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export type KeySourceType = 'platform' | 'user';

export interface UserKeys {
  openai: string;
  anthropic: string;
  google: string;
}

interface EditorPanelProps {
  prompt: string;
  targetPlatform: PlatformDestination;
  onPromptChange: (value: string) => void;
  onTargetPlatformChange: (value: PlatformDestination) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  workingDraft: { draftId: string; content: string } | null;
  keySource?: KeySourceType;
  onKeySourceChange?: (source: KeySourceType) => void;
  userKeys?: UserKeys;
  onUserKeysChange?: (keys: UserKeys) => void;
}

export function EditorPanel(props: EditorPanelProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-serif uppercase">Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-7 w-7 p-0"
              title="API Key Settings"
              aria-label="Toggle API key settings"
              aria-expanded={showSettings}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Badge variant="secondary">
              {props.keySource === 'user' ? (
                <><Key className="mr-1 h-3 w-3" />BYOK</>
              ) : (
                'Platform Keys'
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <Card className="border-2 border-dashed shadow-none">
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">API Key Source</p>
                <Select
                  value={props.keySource || 'platform'}
                  onValueChange={(v) => props.onKeySourceChange?.(v as KeySourceType)}
                >
                  <SelectTrigger className="w-[160px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform (Subscription)</SelectItem>
                    <SelectItem value="user">Bring Your Own Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {props.keySource === 'user' && (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="OpenAI API Key"
                    value={props.userKeys?.openai || ''}
                    onChange={(e) => props.onUserKeysChange?.({ ...props.userKeys!, openai: e.target.value })}
                    className="w-full border-2 bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground"
                  />
                  <input
                    type="password"
                    placeholder="Anthropic API Key"
                    value={props.userKeys?.anthropic || ''}
                    onChange={(e) => props.onUserKeysChange?.({ ...props.userKeys!, anthropic: e.target.value })}
                    className="w-full border-2 bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground"
                  />
                  <input
                    type="password"
                    placeholder="Google AI API Key"
                    value={props.userKeys?.google || ''}
                    onChange={(e) => props.onUserKeysChange?.({ ...props.userKeys!, google: e.target.value })}
                    className="w-full border-2 bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground">Keys are stored locally and sent securely. Never logged server-side.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <Textarea
            value={props.prompt}
            onChange={(event) => props.onPromptChange(event.target.value)}
            placeholder="Write your content prompt..."
            className="min-h-[150px]"
            maxLength={MAX_PROMPT_LENGTH}
            disabled={props.isGenerating}
          />
          <p className={cn(
            'mt-1 text-xs text-right',
            props.prompt.length > MAX_PROMPT_LENGTH * 0.9 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {props.prompt.length}/{MAX_PROMPT_LENGTH}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={props.targetPlatform}
            onValueChange={(value: string) => props.onTargetPlatformChange(value as PlatformDestination)}
            disabled={props.isGenerating}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Target platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={props.onGenerate}
            disabled={props.isGenerating || !props.prompt.trim()}
            className={cn("sm:ml-auto", props.isGenerating && "animate-pulse")}
            title={!props.prompt.trim() ? 'Enter a prompt to generate drafts' : props.isGenerating ? 'Generation in progress...' : ''}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {props.isGenerating ? 'Generating...' : 'Generate 6 Drafts'}
          </Button>
        </div>

        {props.workingDraft ? (
          <Card className="border-2 border-dashed border-slate-900 dark:border-slate-800 shadow-none animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Working Draft</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[220px]">
              <p className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-foreground">{props.workingDraft.content}</p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-xs text-muted-foreground italic pt-2">Winner appears here after convergence.</p>
        )}
      </CardContent>
    </Card>
  );
}
