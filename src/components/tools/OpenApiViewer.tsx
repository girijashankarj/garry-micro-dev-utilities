import { useState, useCallback } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { InfoTooltip, Tooltip } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function OpenApiViewer() {
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      toast.error('File too large');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsed: any;

        if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          parsed = yaml.load(content);
        } else {
          parsed = JSON.parse(content);
        }

        setSpec(parsed);
        setError(null);
        toast.success('OpenAPI spec loaded successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
        setError(errorMessage);
        toast.error('Failed to parse OpenAPI spec');
      }
    };
    reader.readAsText(file);
  }, []);

  const loadSample = useCallback(async () => {
    try {
      const response = await fetch('/samples/pizza-store.yaml');
      const content = await response.text();
      const parsed = yaml.load(content);
      setSpec(parsed);
      setError(null);
      toast.success('Sample OpenAPI spec loaded');
    } catch (err) {
      setError('Failed to load sample');
      toast.error('Failed to load sample');
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>OpenAPI Swagger Viewer</CardTitle>
            <InfoTooltip content="Upload OpenAPI 3.x specification files (YAML or JSON) to view interactive API documentation. Supports Swagger UI features like 'Try it out', schema exploration, and endpoint testing. Maximum file size: 10MB." />
          </div>
          <CardDescription>
            Upload OpenAPI YAML/JSON files and render interactive API documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Upload OpenAPI Spec</label>
                  <InfoTooltip content="Upload OpenAPI 3.x files in YAML (.yaml, .yml) or JSON (.json) format. The file will be parsed and rendered as interactive API documentation." />
                </div>
                <FileInput
                  accept=".yaml,.yml,.json"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            <Tooltip content="Load a sample OpenAPI specification to see how the viewer works">
              <Button onClick={loadSample} variant="outline">
                Load Sample
              </Button>
            </Tooltip>
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {spec && (
        <Card>
          <CardContent className="p-0">
            <div className="swagger-ui-wrapper">
              <SwaggerUI spec={spec} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
