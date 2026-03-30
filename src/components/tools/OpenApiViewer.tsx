import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { Textarea } from '@/components/ui/textarea';
import { InfoTooltip, Tooltip } from '@/components/ui/tooltip';
import {
  compressOpenApiRawForHash,
  decompressOpenApiRawFromHash,
  MAX_SHARE_ENCODED_LENGTH,
  OPENAPI_HASH_PREFIX,
} from '@/lib/openApiShareLink';
import { parseOpenApiSpec, isOpenApiLike } from '@/lib/parseOpenApiSpec';
import { toast } from 'sonner';
import pizzaSampleYaml from '../../../samples/pizza-store.yaml?raw';

const MAX_BYTES = 10 * 1024 * 1024;

type PreviewMode = 'interactive' | 'raw';

export function OpenApiViewer() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [sourceRaw, setSourceRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('interactive');
  const shareFromHashRef = useRef(false);

  const applySpec = useCallback((parsed: unknown, raw: string, sourceLabel: string) => {
    if (!isOpenApiLike(parsed)) {
      setError(
        'This file does not look like an OpenAPI or Swagger document (missing openapi or swagger field).'
      );
      toast.error('Invalid OpenAPI document');
      return;
    }
    setSpec(parsed as Record<string, unknown>);
    setSourceRaw(raw);
    setError(null);
    setPreviewMode('interactive');
    toast.success(`${sourceLabel} loaded`);
  }, []);

  useEffect(() => {
    if (shareFromHashRef.current) return;
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.startsWith(`#${OPENAPI_HASH_PREFIX}`)) return;
    shareFromHashRef.current = true;
    const encoded = hash.slice(`#${OPENAPI_HASH_PREFIX}`.length);
    try {
      const raw = decompressOpenApiRawFromHash(encoded);
      if (!raw) throw new Error('empty');
      const parsed = parseOpenApiSpec(raw, 'shared.yaml');
      applySpec(parsed, raw, 'Shared link');
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    } catch {
      toast.error('Could not load shared link (invalid or corrupted).');
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, [applySpec]);

  const handleShareLink = useCallback(() => {
    if (!sourceRaw) {
      toast.error('Nothing to share yet');
      return;
    }
    const encoded = compressOpenApiRawForHash(sourceRaw);
    if (encoded.length > MAX_SHARE_ENCODED_LENGTH) {
      toast.error(
        'Spec is too large to embed in a link. Use a smaller file or share the file directly.'
      );
      return;
    }
    const u = new URL(window.location.href);
    u.hash = `${OPENAPI_HASH_PREFIX}${encoded}`;
    void navigator.clipboard.writeText(u.toString());
    toast.success('Copied link with embedded spec');
  }, [sourceRaw]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_BYTES) {
        setError('File size exceeds 10MB limit');
        toast.error('File too large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = parseOpenApiSpec(content, file.name);
          applySpec(parsed, content, file.name);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
          setError(errorMessage);
          toast.error('Failed to parse OpenAPI spec');
        }
      };
      reader.readAsText(file);
    },
    [applySpec]
  );

  const loadSample = useCallback(() => {
    try {
      const parsed = parseOpenApiSpec(pizzaSampleYaml, 'pizza-store.yaml');
      applySpec(parsed, pizzaSampleYaml, 'Sample');
    } catch {
      setError('Failed to load sample');
      toast.error('Failed to load sample');
    }
  }, [applySpec]);

  const loadPaste = useCallback(() => {
    const t = pasteText.trim();
    if (!t) {
      toast.error('Paste YAML or JSON first');
      return;
    }
    try {
      const parsed = parseOpenApiSpec(t, 'pasted.yaml');
      applySpec(parsed, t, 'Pasted spec');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse';
      setError(errorMessage);
      toast.error('Could not parse pasted content');
    }
  }, [pasteText, applySpec]);

  const clearAll = useCallback(() => {
    setSpec(null);
    setSourceRaw(null);
    setError(null);
    setPasteText('');
    toast.info('Cleared');
  }, []);

  const rawDisplay = useMemo(() => {
    if (!spec) return '';
    if (sourceRaw && sourceRaw.trim().startsWith('{')) {
      try {
        return JSON.stringify(JSON.parse(sourceRaw), null, 2);
      } catch {
        return sourceRaw;
      }
    }
    if (sourceRaw && !sourceRaw.trim().startsWith('{')) {
      return sourceRaw;
    }
    return JSON.stringify(spec, null, 2);
  }, [spec, sourceRaw]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Swagger / OpenAPI (API specification) preview</CardTitle>
            <InfoTooltip content="Upload or paste Swagger 2.x or OpenAPI 3.x (YAML or JSON). Share a link with the spec embedded (compressed in the URL hash) for demos — very large specs may exceed browser limits. Max file 10MB. Nothing is uploaded to a server." />
          </div>
          <CardDescription>
            Upload a <strong>swagger</strong> / <strong>OpenAPI</strong> file and preview
            operations, schemas, and examples — or paste the spec text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Upload spec</label>
                  <InfoTooltip content="Accepts .yaml, .yml, .json, and common Swagger filenames. JSON is detected by leading { or [. YAML otherwise." />
                </div>
                <FileInput accept=".yaml,.yml,.json,.swagger,.txt" onChange={handleFileUpload} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Tooltip content="Load a sample OpenAPI 3 spec to try the viewer">
                <Button type="button" onClick={loadSample} variant="outline" className="min-h-10">
                  Load sample
                </Button>
              </Tooltip>
              {spec && sourceRaw && (
                <Tooltip content="Copy a URL that embeds this spec (compressed). Paste in a browser to reopen the same preview.">
                  <Button
                    type="button"
                    onClick={handleShareLink}
                    variant="secondary"
                    className="min-h-10 gap-1.5"
                  >
                    <Share2 className="size-4" aria-hidden />
                    Share link
                  </Button>
                </Tooltip>
              )}
              {spec && (
                <Button type="button" onClick={clearAll} variant="ghost" className="min-h-10">
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="openapi-paste" className="text-sm font-medium">
                Or paste YAML / JSON
              </label>
            </div>
            <Textarea
              id="openapi-paste"
              placeholder="Paste your full OpenAPI or Swagger document here…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="min-h-[120px] font-mono text-xs"
            />
            <Button type="button" onClick={loadPaste} variant="secondary" size="sm">
              Load pasted spec
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {spec && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Interactive docs (Swagger UI) or raw spec text</CardDescription>
            </div>
            <div className="flex rounded-md border border-border p-0.5 bg-muted/40">
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'interactive' ? 'default' : 'ghost'}
                className="rounded-sm"
                onClick={() => setPreviewMode('interactive')}
              >
                Interactive
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewMode === 'raw' ? 'default' : 'ghost'}
                className="rounded-sm"
                onClick={() => setPreviewMode('raw')}
              >
                Raw spec
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {previewMode === 'interactive' ? (
              <div className="swagger-ui-wrapper border-t border-border">
                <SwaggerUI spec={spec} />
              </div>
            ) : (
              <pre className="max-h-[70vh] overflow-auto overflow-x-auto border-t border-border bg-muted/30 p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
                {rawDisplay}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
