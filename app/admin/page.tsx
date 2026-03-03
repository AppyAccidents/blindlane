// ============================================
// Admin Dashboard
// Overview stats and quick actions
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { formatCost } from '@/lib/utils';

interface DashboardStats {
  totalComparisons: number;
  totalVotes: number;
  todayComparisons: number;
  todayCost: number;
  activeModels: { name: string; usage: number }[];
  recentActivity: { time: string; action: string; details: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API calls
    setStats({
      totalComparisons: 1247,
      totalVotes: 982,
      todayComparisons: 23,
      todayCost: 0.045,
      activeModels: [
        { name: 'GPT-4o Mini', usage: 52 },
        { name: 'Claude 3.5 Haiku', usage: 48 },
      ],
      recentActivity: [
        { time: '14:32:05', action: 'COMPARISON', details: 'New comparison #1247' },
        { time: '14:28:12', action: 'VOTE', details: 'Vote recorded for #1246' },
        { time: '14:15:33', action: 'COMPARISON', details: 'New comparison #1246' },
        { time: '13:42:18', action: 'RATE_LIMIT', details: 'IP 192.168.1.45 hit limit' },
      ],
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyan-400 font-mono animate-pulse">LOADING_DATA...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-cyan-400 font-mono mb-1">
          &gt; Dashboard
        </h1>
        <p className="text-cyan-700 text-sm font-mono">
          System overview and real-time metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="TOTAL_COMPARISONS"
          value={stats?.totalComparisons.toLocaleString() || '0'}
          trend="+12%"
          trendUp={true}
          icon="◉"
        />
        <StatCard
          label="TOTAL_VOTES"
          value={stats?.totalVotes.toLocaleString() || '0'}
          trend="78.7%"
          trendLabel="vote rate"
          icon="◊"
        />
        <StatCard
          label="TODAY_COMPARISONS"
          value={stats?.todayComparisons.toString() || '0'}
          trend="On track"
          trendUp={true}
          icon="◈"
        />
        <StatCard
          label="TODAY_COST"
          value={formatCost(stats?.todayCost || 0)}
          trend="$9.96 remaining"
          trendUp={true}
          icon="$"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model Usage */}
        <div className="terminal-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cyan-400 font-mono font-semibold flex items-center gap-2">
              <span>◉</span>
              <span>Model Usage Distribution</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {stats?.activeModels.map((model) => (
              <div key={model.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 font-mono text-sm">{model.name}</span>
                  <span className="text-cyan-500 font-mono text-sm">{model.usage}%</span>
                </div>
                <div className="h-2 rounded-full bg-cyan-900/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                    style={{ width: `${model.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-cyan-500/20">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-cyan-400 font-mono">648</p>
                <p className="text-xs text-cyan-700 font-mono">GPT-4o Mini Wins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400 font-mono">334</p>
                <p className="text-xs text-cyan-700 font-mono">Claude 3.5 Haiku Wins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="terminal-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cyan-400 font-mono font-semibold flex items-center gap-2">
              <span>◊</span>
              <span>Recent Activity</span>
            </h2>
            <button className="text-xs text-cyan-600 hover:text-cyan-400 font-mono">
              View All →
            </button>
          </div>
          
          <div className="space-y-2">
            {stats?.recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
              >
                <span className="text-xs text-cyan-700 font-mono w-16">
                  {activity.time}
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  activity.action === 'COMPARISON' ? 'bg-cyan-500/20 text-cyan-400' :
                  activity.action === 'VOTE' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {activity.action}
                </span>
                <span className="text-sm text-cyan-300 flex-1 truncate">
                  {activity.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="terminal-panel">
        <h2 className="text-cyan-400 font-mono font-semibold mb-4 flex items-center gap-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </h2>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton label="Export Data" icon="↓" />
          <QuickActionButton label="Clear Cache" icon="↻" />
          <QuickActionButton label="Reset Limits" icon="✓" />
          <QuickActionButton label="System Check" icon="◉" />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="terminal-panel">
        <h2 className="text-cyan-400 font-mono font-semibold mb-4 flex items-center gap-2">
          <span>$</span>
          <span>Cost Breakdown (Last 7 Days)</span>
        </h2>
        
        <div className="h-48 flex items-end gap-2">
          {[0.12, 0.08, 0.15, 0.11, 0.09, 0.13, 0.045].map((cost, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-cyan-500/50 to-cyan-400/80 rounded-t transition-all hover:from-orange-500/50 hover:to-orange-400/80"
                style={{ height: `${(cost / 0.2) * 100}%` }}
              />
              <span className="text-xs text-cyan-700 font-mono">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm font-mono">
          <span className="text-cyan-600">Total (7d): {formatCost(0.675)}</span>
          <span className="text-cyan-600">Avg/day: {formatCost(0.096)}</span>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  trend,
  trendLabel,
  trendUp,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  trendLabel?: string;
  trendUp?: boolean;
  icon: string;
}) {
  return (
    <div className="terminal-panel p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cyan-600 font-mono mb-1">{label}</p>
          <p className="text-2xl font-bold text-cyan-400 font-mono">{value}</p>
        </div>
        <span className="text-cyan-600 text-lg">{icon}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-xs font-mono ${trendUp ? 'text-green-400' : 'text-orange-400'}`}>
          {trend}
        </span>
        {trendLabel && (
          <span className="text-xs text-cyan-700 font-mono">{trendLabel}</span>
        )}
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all font-mono text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
