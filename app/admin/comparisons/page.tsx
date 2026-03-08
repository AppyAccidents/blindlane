'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { formatCost, formatDate } from '@/lib/utils';
import { Comparison } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function exportCsv(rows: Comparison[]) {
  const headers = ['ID', 'Timestamp', 'Prompt', 'Model A', 'Model B', 'Winner', 'Cost'];
  const csvRows = rows.map((c) => [
    c.id,
    c.created_at,
    `"${c.prompt_text.replace(/"/g, '""')}"`,
    c.model_a,
    c.model_b,
    c.winner || '',
    c.total_cost_usd.toFixed(6),
  ]);
  const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blindlane-comparisons-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminComparisons() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce the search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchComparisons = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (debouncedSearch) params.set('search', debouncedSearch);

    fetch(`/api/comparisons?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComparisons(data.comparisons);
          setTotal(data.total);
        } else {
          setError(data.error || 'Failed to load comparisons');
        }
      })
      .catch(() => setError('Unable to fetch comparisons'))
      .finally(() => setLoading(false));
  }, [filter, debouncedSearch]);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const allSelected = comparisons.length > 0 && selectedIds.length === comparisons.length;

  if (error) {
    return (
      <div className="space-y-6">
        <header className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Comparisons</h1>
        </header>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchComparisons}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="border-l-4 border-primary pl-6">
          <h1 className="font-serif text-2xl font-black tracking-tight uppercase">Comparisons</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} total records</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv(comparisons)} disabled={comparisons.length === 0}>
          Export CSV
        </Button>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="md:max-w-sm"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="md:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="voted">Voted</SelectItem>
              <SelectItem value="unvoted">Unvoted</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 ? (
            <Badge variant="secondary" className="md:ml-auto">
              {selectedIds.length} selected
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Run Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading comparisons...</p>
          ) : comparisons.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comparisons yet. Run an arena session from the Workspace to see data here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => setSelectedIds(e.target.checked ? comparisons.map((c) => c.id) : [])}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisons.map((comp) => (
                  <TableRow key={comp.id} data-state={selectedIds.includes(comp.id) ? 'selected' : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(comp.id)}
                        onChange={() => toggleSelection(comp.id)}
                        aria-label={`Select ${comp.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {comp.id.length > 8 ? `${comp.id.slice(0, 8)}...` : comp.id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(comp.created_at)}</TableCell>
                    <TableCell className="max-w-[380px] truncate">{comp.prompt_text}</TableCell>
                    <TableCell>
                      {comp.winner ? <Badge>{comp.winner} won</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                    <TableCell>{formatCost(comp.total_cost_usd, 2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(comp.id)}>
                            Copy ID
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {comparisons.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Total Cost" value={formatCost(comparisons.reduce((sum, c) => sum + c.total_cost_usd, 0), 2)} />
          <Stat label="Voted" value={`${comparisons.filter((c) => c.winner).length}`} />
          <Stat
            label="Avg Cost/Run"
            value={formatCost(comparisons.reduce((sum, c) => sum + c.total_cost_usd, 0) / comparisons.length, 2)}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-lg font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
