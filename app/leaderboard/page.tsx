// ============================================
// Leaderboard Page
// Shows voting statistics and which model is winning
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { ModelStats } from '@/types';
import { formatCost } from '@/lib/utils';

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
      const data = await response.json();
      
      if (data.success) {
        setData(data);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get display name
  const getDisplayName = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (modelName === 'claude-3-5-haiku') return 'Claude 3.5 Haiku';
    return modelName;
  };

  // Helper to get color
  const getModelColor = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'blue';
    if (modelName === 'claude-3-5-haiku') return 'purple';
    return 'gray';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600 dark:bg-red-950 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-slate-600 dark:text-slate-400">
        No data available
      </div>
    );
  }

  const { stats, summary } = data;
  
  // Sort by win rate
  const sortedStats = [...stats].sort((a, b) => b.win_rate - a.win_rate);
  const leader = sortedStats[0];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          See which AI model users prefer overall
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Total Comparisons</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {summary.totalComparisons.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Today's Cost</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCost(summary.totalCost)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">Current Leader</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {leader ? getDisplayName(leader.model_name) : 'N/A'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Budget Used</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {summary.budgetPercentUsed.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Daily Budget
          </h2>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {formatCost(summary.totalCost)} / {formatCost(summary.budgetLimit)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(summary.budgetPercentUsed, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {summary.budgetRemaining > 0
            ? `${formatCost(summary.budgetRemaining)} remaining today`
            : 'Daily budget exhausted'}
        </p>
      </div>

      {/* Model Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Model Performance
        </h2>
        
        {sortedStats.map((stat, index) => {
          const color = getModelColor(stat.model_name);
          const isLeader = index === 0 && stat.total_votes > 0;
          
          return (
            <div
              key={stat.model_name}
              className={`rounded-xl border bg-white p-6 transition-all dark:bg-slate-900 ${
                isLeader
                  ? 'border-yellow-400 ring-2 ring-yellow-400/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900`}
                  >
                    {isLeader && (
                      <Trophy className={`h-6 w-6 text-yellow-600`} />
                    )}
                    {!isLeader && (
                      <span className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {getDisplayName(stat.model_name)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {stat.total_votes} votes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stat.wins}
                    </p>
                    <p className="text-xs text-slate-500">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stat.losses}
                    </p>
                    <p className="text-xs text-slate-500">Losses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.ties}
                    </p>
                    <p className="text-xs text-slate-500">Ties</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.total_votes > 0 ? `${stat.win_rate}%` : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500">Win Rate</p>
                </div>
              </div>

              {/* Win rate bar */}
              {stat.total_votes > 0 && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-${color}-500 transition-all duration-500`}
                      style={{ width: `${stat.win_rate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedStats.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-600 dark:text-slate-400">
              No votes yet. Be the first to compare!
            </p>
            <a
              href="/"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Start Comparing
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
