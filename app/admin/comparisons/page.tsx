// ============================================
// Admin Comparisons Management
// View, filter, and manage all comparisons
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { formatCost, formatDate } from '@/lib/utils';
import { Comparison } from '@/types';

export default function AdminComparisons() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // Simulated data - replace with actual API call
    const mockData: Comparison[] = Array.from({ length: 20 }, (_, i) => ({
      id: `comp-${1000 + i}`,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      prompt_text: [
        'Explain quantum computing in simple terms',
        'Write a Python function to sort a list',
        'What are the benefits of meditation?',
        'Compare React vs Vue.js',
        'How does photosynthesis work?',
      ][i % 5],
      prompt_length: 45 + i * 5,
      model_a: i % 2 === 0 ? 'gpt-4o-mini' : 'claude-3-5-haiku',
      model_b: i % 2 === 0 ? 'claude-3-5-haiku' : 'gpt-4o-mini',
      response_a: 'Response from model A...',
      response_b: 'Response from model B...',
      tokens_input_a: 50,
      tokens_output_a: 150 + i * 10,
      tokens_input_b: 50,
      tokens_output_b: 140 + i * 10,
      cost_a_usd: 0.00015 + i * 0.00001,
      cost_b_usd: 0.00025 + i * 0.00001,
      total_cost_usd: 0.0004 + i * 0.00002,
      winner: i % 3 === 0 ? null : (i % 3 === 1 ? 'A' : 'B'),
      voted_at: i % 3 === 0 ? null : new Date(Date.now() - i * 1800000).toISOString(),
      user_id: null,
      ip_address: `192.168.1.${100 + i}`,
      user_agent: 'Mozilla/5.0...',
    }));
    
    setComparisons(mockData);
    setLoading(false);
  }, []);

  const filteredComparisons = comparisons.filter(comp => {
    if (filter === 'voted' && !comp.winner) return false;
    if (filter === 'unvoted' && comp.winner) return false;
    if (search && !comp.prompt_text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredComparisons.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyan-400 font-mono animate-pulse">LOADING_COMPARISONS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 font-mono mb-1">
            &gt; Comparisons
          </h1>
          <p className="text-cyan-700 text-sm font-mono">
            {comparisons.length.toLocaleString()} total records
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded border border-orange-500/30 bg-orange-500/10">
              <span className="text-orange-400 font-mono text-sm">
                {selectedIds.length} selected
              </span>
              <button 
                onClick={clearSelection}
                className="text-orange-600 hover:text-orange-400"
              >
                ✕
              </button>
            </div>
          )}
          <button className="btn-cyber text-xs">
            EXPORT_CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="terminal-panel p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600">🔍</span>
              <input
                type="text"
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="terminal-input pl-10"
              />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              ALL
            </FilterButton>
            <FilterButton active={filter === 'voted'} onClick={() => setFilter('voted')}>
              VOTED
            </FilterButton>
            <FilterButton active={filter === 'unvoted'} onClick={() => setFilter('unvoted')}>
              UNVOTED
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded border border-orange-500/30 bg-orange-500/5">
          <span className="text-orange-400 font-mono text-sm">
            Bulk Actions ({selectedIds.length}):
          </span>
          <button className="text-xs text-cyan-400 hover:text-cyan-300 font-mono px-3 py-1 rounded bg-cyan-500/10">
            DELETE
          </button>
          <button className="text-xs text-cyan-400 hover:text-cyan-300 font-mono px-3 py-1 rounded bg-cyan-500/10">
            EXPORT
          </button>
        </div>
      )}

      {/* Table */}
      <div className="terminal-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-cyan-500/30 bg-transparent"
                    onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                    checked={selectedIds.length === filteredComparisons.length && filteredComparisons.length > 0}
                  />
                </th>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Prompt</th>
                <th>Models</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComparisons.map((comp) => (
                <tr key={comp.id} className={selectedIds.includes(comp.id) ? 'bg-cyan-500/5' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      className="rounded border-cyan-500/30 bg-transparent"
                      checked={selectedIds.includes(comp.id)}
                      onChange={() => toggleSelection(comp.id)}
                    />
                  </td>
                  <td className="font-mono text-xs text-cyan-600">
                    #{comp.id.split('-')[1]}
                  </td>
                  <td className="font-mono text-xs text-cyan-700">
                    {formatDate(comp.created_at)}
                  </td>
                  <td>
                    <p className="text-sm text-cyan-300 truncate max-w-xs">
                      {comp.prompt_text}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="badge badge-cyan text-xs">
                        {comp.model_a === 'gpt-4o-mini' ? 'GPT' : 'CLA'}
                      </span>
                      <span className="text-cyan-700">vs</span>
                      <span className="badge badge-orange text-xs">
                        {comp.model_b === 'gpt-4o-mini' ? 'GPT' : 'CLA'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {comp.winner ? (
                      <span className={`badge text-xs ${
                        comp.winner === 'A' ? 'badge-cyan' : 
                        comp.winner === 'B' ? 'badge-orange' : 'badge-green'
                      }`}>
                        {comp.winner} WON
                      </span>
                    ) : (
                      <span className="badge badge-gray">PENDING</span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-cyan-500">
                    {formatCost(comp.total_cost_usd)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-cyan-600 hover:text-cyan-400 text-xs">
                        VIEW
                      </button>
                      <button className="text-orange-600 hover:text-orange-400 text-xs">
                        DEL
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-cyan-500/20">
          <span className="text-xs text-cyan-700 font-mono">
            Showing {filteredComparisons.length} of {comparisons.length} records
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-cyan-500/30 text-cyan-600 text-xs hover:bg-cyan-500/10 disabled:opacity-50" disabled>
              ← Prev
            </button>
            <span className="text-xs text-cyan-700 font-mono">Page 1 of 5</span>
            <button className="px-3 py-1 rounded border border-cyan-500/30 text-cyan-600 text-xs hover:bg-cyan-500/10">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryBox label="Total Cost" value={formatCost(comparisons.reduce((sum, c) => sum + c.total_cost_usd, 0))} />
        <SummaryBox label="Voted" value={`${comparisons.filter(c => c.winner).length} (${Math.round(comparisons.filter(c => c.winner).length / comparisons.length * 100)}%)`} />
        <SummaryBox label="Avg Cost/Comp" value={formatCost(comparisons.reduce((sum, c) => sum + c.total_cost_usd, 0) / comparisons.length)} />
        <SummaryBox label="Unique IPs" value="47" />
      </div>
    </div>
  );
}

// Filter Button Component
function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded text-xs font-mono transition-all ${
        active 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
          : 'bg-transparent text-cyan-600 border border-cyan-500/20 hover:border-cyan-500/40'
      }`}
    >
      {children}
    </button>
  );
}

// Summary Box Component
function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="terminal-panel p-4 text-center">
      <p className="text-xs text-cyan-700 font-mono mb-1">{label}</p>
      <p className="text-lg font-bold text-cyan-400 font-mono">{value}</p>
    </div>
  );
}
