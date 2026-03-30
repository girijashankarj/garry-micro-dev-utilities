import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function copy(text: string, label: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Copy failed')
  );
}

function parseEpoch(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (Math.abs(n) > 1e12) return Math.floor(n);
  return Math.floor(n * 1000);
}

function formatRelative(ms: number): string {
  const diffSec = Math.round((ms - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  const diffMin = Math.round(diffSec / 60);
  if (abs < 3600) return rtf.format(diffMin, 'minute');
  const diffHr = Math.round(diffSec / 3600);
  if (abs < 86400) return rtf.format(diffHr, 'hour');
  const diffDay = Math.round(diffSec / 86400);
  if (abs < 86400 * 30) return rtf.format(diffDay, 'day');
  const diffMonth = Math.round(diffSec / (86400 * 30));
  if (abs < 86400 * 365) return rtf.format(diffMonth, 'month');
  return rtf.format(Math.round(diffSec / (86400 * 365)), 'year');
}

export function UnixTimeConverter() {
  const [epochInput, setEpochInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateLocalInput, setDateLocalInput] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const epochMs = useMemo(() => parseEpoch(epochInput), [epochInput]);

  const fromEpoch = useMemo(() => {
    if (epochMs === null) return null;
    const d = new Date(epochMs);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [epochMs]);

  const applyNow = useCallback(() => {
    const s = Math.floor(Date.now() / 1000);
    setEpochInput(String(s));
    toast.success('Set to current time (seconds)');
  }, []);

  const syncFromDatetime = useCallback(() => {
    const d = new Date(dateLocalInput);
    if (Number.isNaN(d.getTime())) {
      toast.error('Invalid datetime');
      return;
    }
    setEpochInput(String(Math.floor(d.getTime() / 1000)));
    toast.success('Epoch updated from local datetime');
  }, [dateLocalInput]);

  const syncToDatetime = useCallback(() => {
    if (fromEpoch === null) {
      toast.error('Invalid epoch');
      return;
    }
    const d = fromEpoch;
    const pad = (n: number) => String(n).padStart(2, '0');
    setDateLocalInput(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
    toast.success('Datetime inputs synced from epoch');
  }, [fromEpoch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unix time</CardTitle>
          <CardDescription>
            Enter seconds or milliseconds since epoch. Values above 1e12 are treated as
            milliseconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium block mb-1">Epoch (seconds or ms)</label>
              <Input
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                className="font-mono"
                placeholder="1700000000"
              />
            </div>
            <Button type="button" variant="outline" onClick={applyNow}>
              Now
            </Button>
          </div>

          {fromEpoch === null ? (
            <p className="text-sm text-destructive">Could not parse epoch number.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border p-3 space-y-2">
                <Row
                  label="Unix (seconds)"
                  value={String(Math.floor(fromEpoch.getTime() / 1000))}
                  onCopy={() => copy(String(Math.floor(fromEpoch.getTime() / 1000)), 'Seconds')}
                />
                <Row
                  label="Unix (milliseconds)"
                  value={String(fromEpoch.getTime())}
                  onCopy={() => copy(String(fromEpoch.getTime()), 'Milliseconds')}
                />
                <Row
                  label="ISO (UTC)"
                  value={fromEpoch.toISOString()}
                  onCopy={() => copy(fromEpoch.toISOString(), 'ISO UTC')}
                />
                <Row
                  label="Local string"
                  value={fromEpoch.toString()}
                  onCopy={() => copy(fromEpoch.toString(), 'Local')}
                />
                <Row
                  label="Relative"
                  value={formatRelative(fromEpoch.getTime())}
                  onCopy={() => copy(formatRelative(fromEpoch.getTime()), 'Relative')}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local datetime</CardTitle>
          <CardDescription>
            datetime-local uses your browser timezone. Sync with epoch either direction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="datetime-local"
            value={dateLocalInput}
            onChange={(e) => setDateLocalInput(e.target.value)}
            className="font-mono max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={syncFromDatetime}>
              Apply datetime → epoch
            </Button>
            <Button type="button" variant="outline" onClick={syncToDatetime}>
              Sync datetime ← epoch
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-start gap-2 min-w-0">
        <span className="font-mono text-xs break-all">{value}</span>
        <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={onCopy}>
          Copy
        </Button>
      </div>
    </div>
  );
}
