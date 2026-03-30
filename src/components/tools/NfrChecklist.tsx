import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = 'pending' | 'pass' | 'fail' | 'na';

type NfrItem = {
  id: string;
  group: string;
  label: string;
  status: Status;
  notes: string;
};

const DEFAULT_ITEMS: Omit<NfrItem, 'status' | 'notes'>[] = [
  { id: 'g1', group: 'Security', label: 'Authentication & authorization model documented' },
  { id: 'g2', group: 'Security', label: 'Secrets not stored in source control' },
  {
    id: 'g3',
    group: 'Security',
    label: 'Encryption in transit (Transport Layer Security / TLS) for external interfaces',
  },
  { id: 'p1', group: 'Performance', label: 'Latency targets defined (p95/p99) for critical paths' },
  { id: 'p2', group: 'Performance', label: 'Load / capacity assumptions documented' },
  {
    id: 'a1',
    group: 'Availability',
    label:
      'Uptime / recovery time objective (RTO) / recovery point objective (RPO) targets defined',
  },
  { id: 'a2', group: 'Availability', label: 'Backup & restore tested' },
  {
    id: 'o1',
    group: 'Observability',
    label: 'Logging strategy (levels, personally identifiable information (PII), retention)',
  },
  { id: 'o2', group: 'Observability', label: 'Metrics & alerting for critical paths' },
  { id: 'd1', group: 'Data', label: 'Data classification & retention' },
  {
    id: 'd2',
    group: 'Data',
    label: 'General Data Protection Regulation (GDPR) / privacy considerations (if applicable)',
  },
];

export function NfrChecklist() {
  const [items, setItems] = useState<NfrItem[]>(() =>
    DEFAULT_ITEMS.map((i) => ({ ...i, status: 'pending' as Status, notes: '' }))
  );

  const update = useCallback((id: string, patch: Partial<NfrItem>) => {
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const summary = useMemo(() => {
    const counts = { pass: 0, fail: 0, na: 0, pending: 0 };
    for (const i of items) {
      counts[i.status] += 1;
    }
    return counts;
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map<string, NfrItem[]>();
    for (const i of items) {
      const list = map.get(i.group) ?? [];
      list.push(i);
      map.set(i.group, list);
    }
    return Array.from(map.entries());
  }, [items]);

  const copySummary = useCallback(() => {
    const lines = [
      '## Non-functional requirements (NFR) checklist summary',
      '',
      `- Pass: ${summary.pass}`,
      `- Fail: ${summary.fail}`,
      `- N/A: ${summary.na}`,
      `- Pending: ${summary.pending}`,
      '',
      '## Items',
      '',
    ];
    for (const i of items) {
      lines.push(`- [${i.status}] **${i.group}**: ${i.label}${i.notes ? ` — ${i.notes}` : ''}`);
    }
    void navigator.clipboard.writeText(lines.join('\n')).then(
      () => toast.success('Summary copied'),
      () => toast.error('Copy failed')
    );
  }, [items, summary]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Non-functional requirements (NFR) review — browser-only checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <span>
            Pass: <strong className="text-green-600 dark:text-green-400">{summary.pass}</strong>
          </span>
          <span>
            Fail: <strong className="text-destructive">{summary.fail}</strong>
          </span>
          <span>
            N/A: <strong>{summary.na}</strong>
          </span>
          <span>
            Pending: <strong>{summary.pending}</strong>
          </span>
          <Button type="button" size="sm" variant="outline" onClick={copySummary}>
            Copy summary text
          </Button>
        </CardContent>
      </Card>

      {groups.map(([group, groupItems]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupItems.map((row) => (
              <div key={row.id} className="rounded-md border p-3 space-y-2">
                <div className="flex flex-wrap gap-3 items-start justify-between">
                  <p className="text-sm font-medium flex-1 min-w-[200px]">{row.label}</p>
                  <Select
                    value={row.status}
                    onValueChange={(v) => update(row.id, { status: v as Status })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="na">Not applicable (N/A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Textarea
                    value={row.notes}
                    onChange={(e) => update(row.id, { notes: e.target.value })}
                    rows={2}
                    className="text-sm"
                    placeholder="Evidence, gaps, follow-ups"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
