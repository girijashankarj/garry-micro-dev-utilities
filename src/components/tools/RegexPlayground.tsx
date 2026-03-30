import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FLAG_OPTIONS = [
  { id: 'g', label: 'g global' },
  { id: 'i', label: 'i ignore case' },
  { id: 'm', label: 'm multiline' },
  { id: 's', label: 's dotAll' },
  { id: 'u', label: 'u unicode' },
  { id: 'y', label: 'y sticky' },
] as const;

function collectMatches(
  pattern: string,
  flags: string,
  text: string
): { matches: RegExpMatchArray[]; error: string | null } {
  try {
    const re = new RegExp(pattern, flags);
    const matches: RegExpMatchArray[] = [];
    const max = 500;
    if (!re.global) {
      const m = re.exec(text);
      if (m) matches.push(m);
      return { matches, error: null };
    }
    const re2 = new RegExp(pattern, flags);
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re2.exec(text)) !== null && guard++ < max) {
      matches.push(m);
      if (m[0].length === 0) {
        re2.lastIndex++;
        if (re2.lastIndex > text.length) break;
      }
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : String(e) };
  }
}

function buildSegments(
  text: string,
  matches: RegExpMatchArray[]
): Array<{ type: 'text' | 'match'; text: string }> {
  if (matches.length === 0) return [{ type: 'text', text }];
  const parts: Array<{ type: 'text' | 'match'; text: string }> = [];
  let last = 0;
  for (const m of matches) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ type: 'text', text: text.slice(last, idx) });
    parts.push({ type: 'match', text: m[0] });
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

export function RegexPlayground() {
  const [pattern, setPattern] = useState('\\w+');
  const [flagSet, setFlagSet] = useState<Record<string, boolean>>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [haystack, setHaystack] = useState('Hello world 123');

  const flags = useMemo(
    () => FLAG_OPTIONS.filter((f) => flagSet[f.id]).reduce((s, f) => s + f.id, ''),
    [flagSet]
  );

  const { matches, error } = useMemo(
    () => collectMatches(pattern, flags, haystack),
    [pattern, flags, haystack]
  );

  const segments = useMemo(() => buildSegments(haystack, matches), [haystack, matches]);

  const toggleFlag = (id: string) => {
    setFlagSet((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copy = (label: string, text: string) => {
    void navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied`),
      () => toast.error('Copy failed')
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern &amp; flags</CardTitle>
          <CardDescription>JavaScript RegExp — use global (g) to find all matches.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Pattern</label>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono"
              placeholder="\d+"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {FLAG_OPTIONS.map((f) => (
              <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagSet[f.id] ?? false}
                  onChange={() => toggleFlag(f.id)}
                  className="rounded border-input"
                />
                {f.label}
              </label>
            ))}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            new RegExp({JSON.stringify(pattern)}, {JSON.stringify(flags)})
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test string</CardTitle>
          <CardDescription>
            Matches are highlighted below (max 500 for global patterns).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={haystack}
            onChange={(e) => setHaystack(e.target.value)}
            className="font-mono text-sm min-h-32"
          />
          {error ? (
            <p className="text-sm text-destructive font-mono">{error}</p>
          ) : (
            <div
              className="rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[4rem]"
              aria-label="Highlighted matches"
            >
              {segments.map((seg, i) =>
                seg.type === 'match' ? (
                  <mark
                    key={i}
                    className="bg-amber-200/90 text-amber-950 dark:bg-amber-900/80 dark:text-amber-50 rounded px-0.5"
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
          <CardDescription>
            {matches.length === 0 ? 'No matches' : `${matches.length} match(es)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.map((m, i) => (
            <div key={i} className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="text-muted-foreground">index {m.index ?? '—'}</span>
              </div>
              <div className="font-mono break-all">
                <span className="text-muted-foreground">[0]: </span>
                {m[0] || '(empty)'}
              </div>
              {m.length > 1 && (
                <div className="space-y-1 pl-2 border-l-2 border-border">
                  {Array.from({ length: m.length - 1 }, (_, gi) => gi + 1).map((gi) => (
                    <div key={gi} className="font-mono text-xs break-all">
                      <span className="text-muted-foreground">[{gi}]: </span>
                      {m[gi] ?? '(undefined)'}
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copy(`Match ${i + 1}`, m[0])}
              >
                Copy full match
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
