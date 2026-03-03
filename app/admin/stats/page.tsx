// ============================================
// Admin Analytics / Stats Page
// Detailed analytics and charts
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { formatCost } from '@/lib/utils';

export default function AdminStats() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Simulated data
    setStats({
      comparisons: {
        total: 1247,
        voted: 982,
        tie: 89,
        byDay: [23, 45, 38, 52, 41, 35, 28],
      },
      models: {
        gpt4o: { wins: 648, losses: 334, ties: 45, cost: 0.38 },
        claude: { wins: 334, losses: 648, ties: 44, cost: 0.52 },
      },
      costs: {
        total: 0.901,
        daily: [0.045, 0.089, 0.076, 0.104, 0.082, 0.070, 0.056],
        projected: 4.20,
      },
      users: {
        unique: 156,
        returning: 34,
        avgPerUser: 8,
      },
      prompts: {
        avgLength: 156,
        categories: [
          { name: 'Coding', count: 423 },
          { name: 'Writing', count: 312 },
          { name: 'Analysis', count: 267 },
          { name: 'Creative', count: 198 },
          { name: 'Other', count: 47 },
        ],
      },
    });
  }, [timeRange]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyan-400 font-mono animate-pulse">LOADING_ANALYTICS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 font-mono mb-1">
            &gt; Analytics
          </h1>
          <p className="text-cyan-700 text-sm font-mono">
            Detailed metrics and insights
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-transparent text-cyan-600 border border-cyan-500/20 hover:border-cyan-500/40'
              }`}
            >
              {range === '24h' ? '24H' : range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Comparisons"
          value={stats.comparisons.total.toLocaleString()}
          change="+12.5%"
          positive={true}
        />
        <MetricCard
          label="Vote Rate"
          value={`${Math.round((stats.comparisons.voted / stats.comparisons.total) * 100)}%`}
          change="+3.2%"
          positive={true}
        />
        <MetricCard
          label="Total Cost"
          value={formatCost(stats.costs.total)}
          change="-8.1%"
          positive={true}
        />
        <MetricCard
          label="Active Users"
          value={stats.users.unique.toString()}
          change="+24"
          positive={true}
        />
      </div>

      {/* Two Column Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Comparisons Chart */}
        <div className="terminal-panel">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-cyan-400 font-mono font-semibold">Daily Comparisons</h2>
            <span className="text-xs text-cyan-600 font-mono">Last 7 Days</span>
          </div>
          
          <div className="h-48 flex items-end gap-2">
            {stats.comparisons.byDay.map((count: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500/60 to-cyan-400/90 rounded-t transition-all hover:from-orange-500/60 hover:to-orange-400/90 relative group"
                  style={{ height: `${(count / 60) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </div>
                </div>
                <span className="text-xs text-cyan-700 font-mono">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-sm font-mono">
            <span className="text-cyan-600">Avg: {Math.round(stats.comparisons.byDay.reduce((a: number, b: number) => a + b, 0) / 7)}/day</span>
            <span className="text-cyan-600">Peak: {Math.max(...stats.comparisons.byDay)}</span>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="terminal-panel">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-cyan-400 font-mono font-semibold">Cost Analysis</h2>
            <span className="text-xs text-cyan-600 font-mono">USD</span>
          </div>
          
          <div className="h-48 flex items-end gap-2">
            {stats.costs.daily.map((cost: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-orange-500/60 to-orange-400/90 rounded-t transition-all hover:from-cyan-500/60 hover:to-cyan-400/90 relative group"
                  style={{ height: `${(cost / 0.12) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-orange-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCost(cost)}
                  </div>
                </div>
                <span className="text-xs text-cyan-700 font-mono">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-sm font-mono">
            <span className="text-cyan-600">Total: {formatCost(stats.costs.total)}</span>
            <span className="text-cyan-600">Proj/Month: {formatCost(stats.costs.projected)}</span>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="terminal-panel">
        <h2 className="text-cyan-400 font-mono font-semibold mb-6">Model Performance</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* GPT-4o Mini */}
          <div className="p-4 rounded border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 font-mono font-semibold">GPT-4o Mini</h3>
              <span className="text-xs text-cyan-600 font-mono">by OpenAI</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cyan-600">Win Rate</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {Math.round((stats.models.gpt4o.wins / (stats.models.gpt4o.wins + stats.models.gpt4o.losses)) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-cyan-900/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${(stats.models.gpt4o.wins / (stats.models.gpt4o.wins + stats.models.gpt4o.losses)) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-cyan-500/20 text-center">
                <div>
                  <p className="text-xl font-bold text-green-400 font-mono">{stats.models.gpt4o.wins}</p>
                  <p className="text-xs text-cyan-700">Wins</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-400 font-mono">{stats.models.gpt4o.losses}</p>
                  <p className="text-xs text-cyan-700">Losses</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-400 font-mono">{stats.models.gpt4o.ties}</p>
                  <p className="text-xs text-cyan-700">Ties</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-600">Total Cost</span>
                  <span className="text-cyan-400 font-mono">{formatCost(stats.models.gpt4o.cost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claude 3.5 Haiku */}
          <div className="p-4 rounded border border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-orange-400 font-mono font-semibold">Claude 3.5 Haiku</h3>
              <span className="text-xs text-orange-600 font-mono">by Anthropic</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600">Win Rate</span>
                <span className="text-lg font-bold text-orange-400 font-mono">
                  {Math.round((stats.models.claude.wins / (stats.models.claude.wins + stats.models.claude.losses)) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-orange-900/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all"
                  style={{ width: `${(stats.models.claude.wins / (stats.models.claude.wins + stats.models.claude.losses)) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-orange-500/20 text-center">
                <div>
                  <p className="text-xl font-bold text-green-400 font-mono">{stats.models.claude.wins}</p>
                  <p className="text-xs text-orange-700">Wins</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-400 font-mono">{stats.models.claude.losses}</p>
                  <p className="text-xs text-orange-700">Losses</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-400 font-mono">{stats.models.claude.ties}</p>
                  <p className="text-xs text-orange-700">Ties</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-orange-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600">Total Cost</span>
                  <span className="text-orange-400 font-mono">{formatCost(stats.models.claude.cost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Categories */}
      <div className="terminal-panel">
        <h2 className="text-cyan-400 font-mono font-semibold mb-6">Prompt Categories</h2>
        
        <div className="space-y-4">
          {stats.prompts.categories.map((cat: any) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cyan-300">{cat.name}</span>
                <span className="text-sm text-cyan-500 font-mono">
                  {cat.count} ({Math.round((cat.count / stats.comparisons.total) * 100)}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-cyan-900/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400 transition-all"
                  style={{ width: `${(cat.count / stats.comparisons.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-cyan-500/20">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-cyan-600">Average Prompt Length</span>
            <span className="text-cyan-400">{stats.prompts.avgLength} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="terminal-panel">
      <p className="text-xs text-cyan-600 font-mono mb-1">{label}</p>
      <p className="text-2xl font-bold text-cyan-400 font-mono mb-2">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? '↑' : '↓'} {change}
        </span>
        <span className="text-xs text-cyan-700">vs last period</span>
      </div>
    </div>
  );
}
