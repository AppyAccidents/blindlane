'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCost } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
  models: { name: string; wins: number; losses: number; ties: number; winRate: number; totalVotes: number }[];
  summary: {
    totalComparisons: number;
    totalCost: number;
    budgetLimit: number;
    budgetRemaining: number;
    budgetPercentUsed: number;
  };
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setError(null);
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || 'Failed to load stats');
          return;
        }

        const models = (data.stats || []).map(
          (s: { model_name: string; wins: number; losses: number; ties: number; total_votes: number; win_rate: number }) => ({
            name: s.model_name,
            wins: s.wins,
            losses: s.losses,
            ties: s.ties,
            winRate: s.win_rate || 0,
            totalVotes: s.total_votes,
          })
        );

        setStats({
          models,
          summary: {
            totalComparisons: data.summary?.totalComparisons ?? 0,
            totalCost: data.summary?.totalCost ?? 0,
            budgetLimit: data.summary?.budgetLimit ?? 10,
            budgetRemaining: data.summary?.budgetRemaining ?? 0,
            budgetPercentUsed: data.summary?.budgetPercentUsed ?? 0,
          },
        });
      })
      .catch(() => setError('Unable to fetch analytics'));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <div className="space-y-6">
        <header className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Analytics</h1>
        </header>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  const totalVotes = stats.models.reduce((sum, m) => sum + m.totalVotes, 0);
  const voteRate = stats.summary.totalComparisons > 0
    ? Math.round((totalVotes / 2 / stats.summary.totalComparisons) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Analytics</h1>
          <p className="font-sans text-sm text-muted-foreground">Usage, quality, and cost metrics.</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Comparisons" value={stats.summary.totalComparisons.toLocaleString()} />
        <Metric label="Vote Rate" value={`${voteRate}%`} />
        <Metric label="Today's Cost" value={formatCost(stats.summary.totalCost, 2)} />
        <Metric label="Budget Remaining" value={formatCost(stats.summary.budgetRemaining, 2)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Daily budget usage</span>
                <span className="text-muted-foreground">{stats.summary.budgetPercentUsed.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted">
                <div
                  className={`h-2 ${stats.summary.budgetPercentUsed > 80 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, stats.summary.budgetPercentUsed)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCost(stats.summary.totalCost, 2)} of {formatCost(stats.summary.budgetLimit, 2)} daily limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Daily Trends</CardTitle>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="py-4 text-sm text-muted-foreground">
              Daily comparison and cost charts will appear here once historical tracking is enabled.
            </p>
          </CardContent>
        </Card>
      </section>

      {stats.models.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {stats.models.map((model) => (
            <ModelCard
              key={model.name}
              label={model.name}
              wins={model.wins}
              losses={model.losses}
              ties={model.ties}
              winRate={model.winRate}
              totalVotes={model.totalVotes}
            />
          ))}
        </section>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No model data yet. Run arena sessions and vote on comparisons to see model performance.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}

function ModelCard({
  label,
  wins,
  losses,
  ties,
  winRate,
  totalVotes,
}: {
  label: string;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  totalVotes: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Win rate</span>
          <span className="font-black">{winRate}%</span>
        </div>
        <div className="h-2 bg-muted">
          <div className="h-2 bg-primary" style={{ width: `${winRate}%` }} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">Wins {wins}</Badge>
          <Badge variant="secondary">Losses {losses}</Badge>
          <Badge variant="secondary">Ties {ties}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Total votes: {totalVotes}</p>
      </CardContent>
    </Card>
  );
}
