'use client';

import { RevealItem } from '@/types';
import { formatCost, getModelDisplayName, getProviderBorderClass, getProviderBadgeVariant, getProviderName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevealPanelProps {
  reveal: RevealItem[];
}

export function RevealPanel(props: RevealPanelProps) {
  if (!props.reveal.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reveal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {props.reveal.map((item) => (
          <div key={item.draftId} className={`border-2 border-slate-900 dark:border-slate-800 p-6 transition-colors hover:bg-secondary/50 ${getProviderBorderClass(item.model)}`}>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant={getProviderBadgeVariant(item.model)}>{getProviderName(item.model)}</Badge>
              <p className="text-sm text-foreground">
                {getModelDisplayName(item.model)} · {item.variant}
              </p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {formatCost(item.cost)} · {item.tokens.toLocaleString()} tokens · {(item.latency / 1000).toFixed(2)}s
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
