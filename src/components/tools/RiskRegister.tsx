import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RiskRow = {
  id: string;
  title: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'closed';
};

function severity(p: number, i: number): { label: string; score: number } {
  const score = p * i;
  if (score >= 15) return { label: 'Critical', score };
  if (score >= 10) return { label: 'High', score };
  if (score >= 6) return { label: 'Medium', score };
  return { label: 'Low', score };
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}

export function RiskRegister() {
  const [risks, setRisks] = useState<RiskRow[]>([
    {
      id: '1',
      title: 'Vendor API rate limits block peak traffic',
      probability: 3,
      impact: 4,
      mitigation: 'Cache responses; negotiate higher quota',
      owner: 'Tech Lead',
      status: 'mitigating',
    },
  ]);

  const update = useCallback((id: string, patch: Partial<RiskRow>) => {
    setRisks((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const addRisk = useCallback(() => {
    setRisks((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        title: '',
        probability: 3,
        impact: 3,
        mitigation: '',
        owner: '',
        status: 'open',
      },
    ]);
  }, []);

  const removeRisk = useCallback((id: string) => {
    setRisks((r) => r.filter((x) => x.id !== id));
  }, []);

  const csv = useMemo(() => {
    const header = [
      'Title',
      'Probability',
      'Impact',
      'Score',
      'Severity',
      'Mitigation',
      'Owner',
      'Status',
    ];
    const body = risks.map((row) => {
      const s = severity(row.probability, row.impact);
      return [
        row.title,
        String(row.probability),
        String(row.impact),
        String(s.score),
        s.label,
        row.mitigation,
        row.owner,
        row.status,
      ];
    });
    return toCsv([header, ...body]);
  }, [risks]);

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
          <CardTitle>Risk register</CardTitle>
          <CardDescription>
            Probability and impact are 1–5. Score = P × I. Severity bands: Low (&lt;6), Medium
            (6–9), High (10–14), Critical (15+).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {risks.map((row) => {
            const s = severity(row.probability, row.impact);
            return (
              <div key={row.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <Input
                    value={row.title}
                    onChange={(e) => update(row.id, { title: e.target.value })}
                    placeholder="Risk title"
                    className="font-medium flex-1 min-w-[200px]"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRisk(row.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Probability (1–5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={row.probability}
                      onChange={(e) =>
                        update(row.id, {
                          probability: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Impact (1–5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={row.impact}
                      onChange={(e) =>
                        update(row.id, {
                          impact: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Score / severity</label>
                    <div className="h-9 flex items-center font-mono text-sm">
                      {s.score} — {s.label}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <Select
                      value={row.status}
                      onValueChange={(v) => update(row.id, { status: v as RiskRow['status'] })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="mitigating">Mitigating</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Owner</label>
                    <Input
                      value={row.owner}
                      onChange={(e) => update(row.id, { owner: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Mitigation</label>
                  <Textarea
                    value={row.mitigation}
                    onChange={(e) => update(row.id, { mitigation: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            );
          })}
          <Button type="button" variant="secondary" onClick={addRisk}>
            Add risk
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
