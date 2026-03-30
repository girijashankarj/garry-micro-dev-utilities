import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Milestone = { id: string; name: string; offsetDays: number };

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}

function addDays(isoDate: string, days: number): Date {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TimelineMilestonePlanner() {
  const [startDate, setStartDate] = useState(() => {
    const t = new Date();
    return t.toISOString().slice(0, 10);
  });
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', name: 'Design freeze', offsetDays: 14 },
    { id: '2', name: 'UAT start', offsetDays: 45 },
    { id: '3', name: 'Go-live', offsetDays: 90 },
  ]);

  const computed = useMemo(() => {
    return milestones.map((m) => {
      const target = addDays(startDate, m.offsetDays);
      return { ...m, target, targetIso: target.toISOString().slice(0, 10) };
    });
  }, [startDate, milestones]);

  const sorted = useMemo(
    () => [...computed].sort((a, b) => a.offsetDays - b.offsetDays),
    [computed]
  );

  const updateMilestone = useCallback((id: string, patch: Partial<Milestone>) => {
    setMilestones((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addMilestone = useCallback(() => {
    setMilestones((r) => [...r, { id: crypto.randomUUID(), name: '', offsetDays: 0 }]);
  }, []);

  const removeMilestone = useCallback((id: string) => {
    setMilestones((r) => r.filter((x) => x.id !== id));
  }, []);

  const csv = useMemo(() => {
    const header = [
      'Milestone',
      'Offset days from start',
      'Target date (ISO)',
      'Target date (local)',
    ];
    const body = sorted.map((m) => [
      m.name,
      String(m.offsetDays),
      m.targetIso,
      formatDate(m.target),
    ]);
    return toCsv([header, ...body]);
  }, [sorted]);

  const copyCsv = useCallback(() => {
    void navigator.clipboard.writeText(csv).then(
      () => toast.success('CSV copied'),
      () => toast.error('Copy failed')
    );
  }, [csv]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project start</CardTitle>
          <CardDescription>
            Offsets are calendar days after the start date (browser local timezone for display).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-medium block mb-1">Start date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Each milestone has a name and offset in days from the project start.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sorted.map((m) => (
            <div key={m.id} className="flex flex-wrap gap-3 items-end rounded-lg border p-3">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input
                  value={m.name}
                  onChange={(e) => updateMilestone(m.id, { name: e.target.value })}
                  placeholder="Milestone"
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground">Offset (days)</label>
                <Input
                  type="number"
                  value={m.offsetDays}
                  onChange={(e) =>
                    updateMilestone(m.id, { offsetDays: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="min-w-[200px] text-sm">
                <span className="text-muted-foreground">Target: </span>
                <span className="font-mono">{m.targetIso}</span>
                <div className="text-muted-foreground text-xs">{formatDate(m.target)}</div>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeMilestone(m.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addMilestone}>
            Add milestone
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
            {csv}
          </pre>
          <Button type="button" onClick={copyCsv}>
            Copy CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
