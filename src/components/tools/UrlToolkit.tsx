import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function copy(text: string, label: string) {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Copy failed')
  );
}

type ParamRow = { key: string; value: string };

/** Remount via key={parsed.href} when the parsed URL changes so rows stay in sync without effects. */
function UrlQueryEditor({ parsed }: { parsed: URL }) {
  const [rows, setRows] = useState<ParamRow[]>(() =>
    Array.from(parsed.searchParams.entries()).map(([key, value]) => ({ key, value }))
  );

  const rebuiltUrl = useMemo(() => {
    try {
      const u = new URL(parsed.origin + parsed.pathname);
      u.hash = parsed.hash;
      const sp = new URLSearchParams();
      rows.forEach(({ key, value }) => {
        if (key !== '') sp.append(key, value);
      });
      u.search = sp.toString();
      return u.toString();
    } catch {
      return '';
    }
  }, [parsed, rows]);

  const updateParam = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }, []);

  const addParam = useCallback(() => {
    setRows((r) => [...r, { key: '', value: '' }]);
  }, []);

  const removeParam = useCallback((index: number) => {
    setRows((r) => r.filter((_, i) => i !== index));
  }, []);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Query parameters</span>
          <Button type="button" size="sm" variant="outline" onClick={addParam}>
            Add param
          </Button>
        </div>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="key"
                value={row.key}
                onChange={(e) => updateParam(i, 'key', e.target.value)}
                className="font-mono flex-1 min-w-[120px]"
              />
              <Input
                placeholder="value"
                value={row.value}
                onChange={(e) => updateParam(i, 'value', e.target.value)}
                className="font-mono flex-1 min-w-[120px]"
              />
              <Button type="button" size="sm" variant="ghost" onClick={() => removeParam(i)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Rebuilt URL</div>
        <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs break-all">
          {rebuiltUrl}
        </div>
        <Button type="button" className="mt-2" size="sm" onClick={() => copy(rebuiltUrl, 'URL')}>
          Copy rebuilt URL
        </Button>
      </div>
    </>
  );
}

export function UrlToolkit() {
  const [urlInput, setUrlInput] = useState('https://example.com/path?q=hello+world&tag=a%2Fb');
  const [encodeInput, setEncodeInput] = useState('hello world & ?');
  const [decodeInput, setDecodeInput] = useState('hello%20world%20%26%20%3F');

  const { parsed, parseError } = useMemo(() => {
    if (!urlInput.trim()) return { parsed: null as URL | null, parseError: null as string | null };
    try {
      return { parsed: new URL(urlInput.trim()), parseError: null };
    } catch {
      return {
        parsed: null,
        parseError: 'Invalid URL — include scheme (e.g. https://)',
      };
    }
  }, [urlInput]);

  const handleEncode = useCallback(() => {
    try {
      setDecodeInput(encodeURIComponent(encodeInput));
      toast.success('Encoded');
    } catch {
      toast.error('Encode failed');
    }
  }, [encodeInput]);

  const handleDecode = useCallback(() => {
    try {
      setEncodeInput(decodeURIComponent(decodeInput));
      toast.success('Decoded');
    } catch {
      toast.error('Invalid percent-encoding');
    }
  }, [decodeInput]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parse &amp; edit URL</CardTitle>
          <CardDescription>
            Full URL with scheme. Query table edits rebuild the link below (browser URL API only).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/path?a=1"
            className="font-mono text-sm min-h-20"
          />
          {parseError && <p className="text-sm text-destructive">{parseError}</p>}
          {parsed && (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Protocol</span>
                <div className="font-mono">{parsed.protocol}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Host</span>
                <div className="font-mono break-all">{parsed.host}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Pathname</span>
                <div className="font-mono break-all">{parsed.pathname}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Hash</span>
                <div className="font-mono break-all">{parsed.hash || '(empty)'}</div>
              </div>
            </div>
          )}

          {parsed && <UrlQueryEditor key={parsed.href} parsed={parsed} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encode / decode component</CardTitle>
          <CardDescription>
            encodeURIComponent / decodeURIComponent for a single string (query fragments, path
            segments).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Plain text</label>
            <Textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              className="font-mono text-sm"
              rows={3}
            />
            <Button type="button" className="mt-2" variant="secondary" onClick={handleEncode}>
              Encode →
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Percent-encoded</label>
            <Textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              className="font-mono text-sm"
              rows={3}
            />
            <Button type="button" className="mt-2" variant="secondary" onClick={handleDecode}>
              ← Decode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
