// ============================================
// Leaderboard Page - Terminal Theme
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

  const getDisplayName = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'GPT-4o Mini';
    if (modelName === 'claude-3-5-haiku') return 'Claude 3.5 Haiku';
    return modelName;
  };

  const getModelColor = (modelName: string) => {
    if (modelName === 'gpt-4o-mini') return 'cyan';
    if (modelName === 'claude-3-5-haiku') return 'orange';
    return 'gray';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">LOADING_LEADERBOARD_DATA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-panel border-red-500/30 text-red-400 text-center p-6 font-mono">
        [ERROR] {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-cyan-600 font-mono">
        NO_DATA_AVAILABLE
      </div>
    );
  }

  const { stats, summary } = data;
  const sortedStats = [...stats].sort((a, b) => b.win_rate - a.win_rate);
  const leader = sortedStats[0];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs text-cyan-400 font-mono">
          <Trophy className="w-3 h-3" />
          LIVE_RANKINGS
        </div>
        <h1 className="text-3xl font-bold text-cyan-400 font-mono glow-cyan">
          &gt; Leaderboard
        </h1>
        <p className="text-cyan-700 font-mono text-sm">
          Aggregate voting results across all comparisons
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="TOTAL_COMPARISONS"
          value={summary.totalComparisons.toLocaleString()}
        />
        <SummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          label="TODAY_COST"
          value={formatCost(summary.totalCost)}
        />
        <SummaryCard
          icon={<Trophy className="w-5 h-5" />}
          label="CURRENT_LEADER"
          value={leader ? getDisplayName(leader.model_name) : 'N/A'}
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="BUDGET_USED"
          value={`${summary.budgetPercentUsed.toFixed(0)}%`}
        />
      </div>

      {/* Budget Progress */}
      <div className="terminal-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-cyan-400 font-mono font-semibold flex items-center gap-2">
            <span>$</span>
            <span>Daily Budget Usage</span>
          </h2>
          <span className="text-sm text-cyan-600 font-mono">
            {formatCost(summary.totalCost)} / {formatCost(summary.budgetLimit)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-cyan-900/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400 transition-all duration-500"
            style={{ width: `${Math.min(summary.budgetPercentUsed, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-cyan-700 font-mono">
          {summary.budgetRemaining > 0
            ? `${formatCost(summary.budgetRemaining)} remaining today`
            : '[WARNING] Daily budget exhausted'}
        </p>
      </div>

      {/* Model Rankings */}
      <div className="space-y-4">
        <h2 className="text-cyan-400 font-mono font-semibold flex items-center gap-2">
          <span>◈</span>
          <span>Model Rankings</span>
        </h2>
        
        {sortedStats.map((stat, index) => {
          const color = getModelColor(stat.model_name);
          const isCyan = color === 'cyan';
          const isLeader = index === 0 && stat.total_votes > 0;
          
          return (
            <div
              key={stat.model_name}
              className={`terminal-panel ${isLeader ? 'border-yellow-500/50' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Model Info */}
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded border ${
                    isLeader ? 'border-yellow-500/50 bg-yellow-500/10' : 
                    isCyan ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-orange-500/30 bg-orange-500/10'
                  }`}>
                    {isLeader ? (
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <span className={`text-lg font-bold ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`}>
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold font-mono ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`}>
                      {getDisplayName(stat.model_name)}
                    </h3>
                    <p className="text-sm text-cyan-700 font-mono">
                      {stat.total_votes} votes
                    </p>
                  </div>
                </div>

                {/* Center: Win/Loss/Tie */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400 font-mono">{stat.wins}</p>
                    <p className="text-xs text-cyan-700 font-mono">WINS</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400 font-mono">{stat.losses}</p>
                    <p className="text-xs text-cyan-700 font-mono">LOSSES</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400 font-mono">{stat.ties}</p>
                    <p className="text-xs text-cyan-700 font-mono">TIES</p>
                  </div>
                </div>

                {/* Right: Win Rate */}
                <div className="text-right">
                  <p className="text-3xl font-bold text-cyan-400 font-mono">
                    {stat.total_votes > 0 ? `${stat.win_rate}%` : 'N/A'}
                  </p>
                  <p className="text-sm text-cyan-700 font-mono">WIN_RATE</p>
                </div>
              </div>

              {/* Win Rate Bar */}
              {stat.total_votes > 0 && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-900/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCyan ? 'bg-cyan-400' : 'bg-orange-400'
                      }`}
                      style={{ width: `${stat.win_rate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedStats.length === 0 && (
          <div className="terminal-panel p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-cyan-800" />
            <p className="text-cyan-600 font-mono">
              No votes yet. Be the first to compare!
            </p>
            <a
              href="/"
              className="btn-cyber inline-flex mt-4"
            >
              Start Comparing
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="terminal-panel">
      <div className="mb-2 flex items-center gap-2 text-cyan-600">
        {icon}
        <span className="text-xs font-mono">{label}</span>
      </div>
      <p className="text-2xl font-bold text-cyan-400 font-mono">{value}</p>
    </div>
  );
}
