'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Sparkles, TrendingUp, Trophy, Users } from 'lucide-react';
import { formatCost } from '@/lib/utils';
import { ModelStats } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsData {
  success: boolean;
  stats: ModelStats[];
  summary: {
    totalComparisons: number;
    totalCost: number;
    budgetLimit: number;
    budgetRemaining: number;
    budgetPercentUsed: number;
  };
}

export default function LeaderboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const responseData = (await response.json()) as StatsData & { error?: string };

      if (responseData.success) {
        setData(responseData);
      } else {
        setError(responseData.error || 'Failed to fetch stats');
      }
    } catch {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (modelName === 'claude-3-5-haiku') return 'Claude 3.5 Haiku';
    if (modelName === 'gemini-2.0-flash') return 'Gemini 2.0 Flash';
    return modelName;
  };

  const getProviderLabel = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'OpenAI';
    if (modelName === 'claude-3-5-haiku') return 'Anthropic';
    if (modelName === 'gemini-2.0-flash') return 'Google';
    return '';
  };

  const getProviderVariant = (modelName: string): 'openai' | 'anthropic' | 'google' | 'default' => {
    if (modelName === 'gpt-4o-mini') return 'openai';
    if (modelName === 'claude-3-5-haiku') return 'anthropic';
    if (modelName === 'gemini-2.0-flash') return 'google';
    return 'default';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load leaderboard</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  const { stats, summary } = data;
  const sortedStats = [...stats].sort((a, b) => b.win_rate - a.win_rate);
  const leader = sortedStats[0];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="inline-flex items-center gap-1">
          <Trophy className="h-3.5 w-3.5" />
          Live Rankings
        </Badge>
        <h1 className="font-serif text-4xl font-black tracking-tight uppercase border-l-4 border-primary pl-6">Model Leaderboard</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Community voting outcomes from blind comparisons.
        </p>
      </header>

      {summary.totalComparisons > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Users className="h-4 w-4" />}
              label="Total Comparisons"
              value={summary.totalComparisons.toLocaleString()}
              trend="All time"
            />
            <SummaryCard
              icon={<DollarSign className="h-4 w-4" />}
              label="Today's Cost"
              value={formatCost(summary.totalCost, 2)}
              trend={`${formatCost(summary.budgetRemaining, 2)} remaining`}
            />
            <SummaryCard
              icon={<Trophy className="h-4 w-4" />}
              label="Current Leader"
              value={leader ? getDisplayName(leader.model_name) : 'N/A'}
              trend={leader ? `${leader.win_rate}% win rate` : 'No votes yet'}
            />
            <SummaryCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Budget Used"
              value={`${summary.budgetPercentUsed.toFixed(0)}%`}
              trend={`${formatCost(summary.budgetRemaining, 2)} left`}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daily Budget Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-2 bg-muted">
                <div className="h-2 bg-primary" style={{ width: `${Math.min(summary.budgetPercentUsed, 100)}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCost(summary.totalCost, 2)} / {formatCost(summary.budgetLimit, 2)}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <section className="space-y-3">
        {sortedStats.length > 0 && (
          <h2 className="font-serif text-xl font-black uppercase tracking-tight">Model Performance</h2>
        )}

        {sortedStats.length === 0 ? (
          <Card>
            <CardContent className="space-y-4 py-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No votes yet. Be the first to compare.</p>
              <Button asChild>
                <Link href="/">Start Comparing</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedStats.map((stat, index) => (
            <Card key={stat.model_name}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge>{index === 0 ? 'Leader' : `#${index + 1}`}</Badge>
                    <div>
                      <p className="font-semibold">{getDisplayName(stat.model_name)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getProviderVariant(stat.model_name) as any}>{getProviderLabel(stat.model_name)}</Badge>
                        <p className="text-xs text-muted-foreground">{stat.total_votes.toLocaleString()} votes</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center lg:w-[300px]">
                    <StatPill label="Wins" value={stat.wins} />
                    <StatPill label="Losses" value={stat.losses} />
                    <StatPill label="Ties" value={stat.ties} />
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-2xl font-black">{stat.total_votes > 0 ? `${stat.win_rate}%` : 'N/A'}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Win Rate</p>
                  </div>
                </div>

                {stat.total_votes > 0 ? (
                  <div className="h-2 bg-muted">
                    <div className="h-2 bg-primary" style={{ width: `${stat.win_rate}%` }} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-slate-900 dark:border-slate-800 bg-muted/40 p-2">
      <p className="text-lg font-black">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
