'use client';

import { useEffect, useState } from 'react';
import { Activity, BarChart3, DollarSign, Users } from 'lucide-react';
import { formatCost } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalComparisons: number;
  totalVotes: number;
  todayCost: number;
  budgetRemaining: number;
  budgetPercentUsed: number;
  activeModels: { name: string; wins: number; total: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || 'Failed to load stats');
          return;
        }

        const totalVotes = (data.stats || []).reduce(
          (sum: number, s: { total_votes: number }) => sum + s.total_votes,
          0
        );

        setStats({
          totalComparisons: data.summary?.totalComparisons ?? 0,
          totalVotes,
          todayCost: data.summary?.totalCost ?? 0,
          budgetRemaining: data.summary?.budgetRemaining ?? 0,
          budgetPercentUsed: data.summary?.budgetPercentUsed ?? 0,
          activeModels: (data.stats || []).map((s: { model: string; wins: number; total_votes: number }) => ({
            name: s.model,
            wins: s.wins,
            total: s.total_votes,
          })),
        });
      })
      .catch(() => setError('Unable to fetch dashboard stats'));
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <header className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Admin Dashboard</h1>
        </header>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-l-4 border-primary pl-6">
        <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Admin Dashboard</h1>
        <p className="font-sans text-sm text-muted-foreground">System overview and operational metrics.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={BarChart3} label="Total Comparisons" value={stats.totalComparisons.toLocaleString()} />
        <MetricCard icon={Users} label="Total Votes" value={stats.totalVotes.toLocaleString()} />
        <MetricCard icon={DollarSign} label="Today's Cost" value={formatCost(stats.todayCost, 2)} />
        <MetricCard icon={Activity} label="Budget Used" value={`${stats.budgetPercentUsed.toFixed(1)}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model Win Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.activeModels.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No vote data yet. Win rates appear after users compare drafts.</p>
            )}
            {stats.activeModels.map((model) => {
              const winRate = model.total > 0 ? Math.round((model.wins / model.total) * 100) : 0;
              return (
                <div key={model.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{model.name}</span>
                    <span className="text-muted-foreground">{winRate}% ({model.wins}/{model.total})</span>
                  </div>
                  <div className="h-2 w-full bg-muted">
                    <div className="h-2 bg-primary" style={{ width: `${winRate}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Daily budget usage</span>
                <span className="text-muted-foreground">{formatCost(stats.todayCost, 2)} spent</span>
              </div>
              <div className="h-2 w-full bg-muted">
                <div
                  className={`h-2 ${stats.budgetPercentUsed > 80 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, stats.budgetPercentUsed)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCost(stats.budgetRemaining, 2)} remaining today
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-black">{value}</p>
          <div className="border-2 border-slate-900 dark:border-slate-800 bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
