'use client';

import { useState } from 'react';
import { Download, FileDown, Check } from 'lucide-react';
import { PlatformDestination } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ExportPanelProps {
  onExport: (destination: PlatformDestination) => void;
  output: {
    destination: PlatformDestination;
    formattedContent: string;
    markdown: string;
    metadata?: Record<string, string | string[]>;
  } | null;
}

export function ExportPanel(props: ExportPanelProps) {
  const [copied, setCopied] = useState<'text' | 'markdown' | null>(null);

  const copyToClipboard = async (text: string, type: 'text' | 'markdown') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for non-HTTPS or unsupported browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-serif uppercase">Export</CardTitle>
          {props.output ? <Badge variant="secondary">{props.output.destination.toUpperCase()}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => props.onExport('linkedin')}>
            <FileDown className="mr-2 h-4 w-4" />
            Format LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => props.onExport('email')}>
            <FileDown className="mr-2 h-4 w-4" />
            Format Email
          </Button>
        </div>

        {props.output && (
          <>
            <Textarea readOnly value={props.output.formattedContent} className="min-h-[180px]" />
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(props.output?.formattedContent || '', 'text')}
                className={cn(copied === 'text' && 'animate-pulse')}
              >
                {copied === 'text' ? <Check className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                {copied === 'text' ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => copyToClipboard(props.output?.markdown || '', 'markdown')}
                className={cn(copied === 'markdown' && 'animate-pulse')}
              >
                {copied === 'markdown' ? 'Copied!' : 'Copy Markdown'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
