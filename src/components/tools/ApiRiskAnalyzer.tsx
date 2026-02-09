import { useState, useCallback } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileInput } from '@/components/ui/file-input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Risk {
  type: 'error' | 'warning' | 'info';
  message: string;
  path?: string;
}

export function ApiRiskAnalyzer() {
  const [spec, setSpec] = useState<any>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = file.name.endsWith('.yaml') || file.name.endsWith('.yml')
          ? yaml.load(content)
          : JSON.parse(content);
        setSpec(parsed);
        setError(null);
        analyzeSpec(parsed);
        toast.success('OpenAPI spec loaded');
      } catch (err) {
        setError('Failed to parse file');
        toast.error('Failed to parse OpenAPI spec');
      }
    };
    reader.readAsText(file);
  }, []);

  const analyzeSpec = useCallback((spec: any) => {
    const foundRisks: Risk[] = [];

    if (!spec.paths) {
      foundRisks.push({ type: 'error', message: 'No paths defined in OpenAPI spec' });
      setRisks(foundRisks);
      return;
    }

    Object.entries(spec.paths).forEach(([path, pathItem]: [string, any]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
          // Check for missing error responses
          if (!operation.responses || !operation.responses['4xx'] && !operation.responses['5xx']) {
            foundRisks.push({
              type: 'warning',
              message: `Missing error responses (4xx/5xx) for ${method.toUpperCase()} ${path}`,
              path: `${method.toUpperCase()} ${path}`,
            });
          }

          // Check for weak validation
          if (operation.requestBody) {
            const content = operation.requestBody.content;
            if (content && content['application/json']) {
              const schema = content['application/json'].schema;
              if (schema && !schema.required && !schema.properties) {
                foundRisks.push({
                  type: 'warning',
                  message: `Weak validation for request body in ${method.toUpperCase()} ${path}`,
                  path: `${method.toUpperCase()} ${path}`,
                });
              }
            }
          }
        }
      });
    });

    setRisks(foundRisks);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Contract Risk Analyzer</CardTitle>
          <CardDescription>
            Analyze OpenAPI specs for missing error responses, weak validation, and breaking change risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileInput
            accept=".yaml,.yml,.json"
            onChange={handleFileUpload}
          />
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
            <CardDescription>
              Found {risks.length} potential issue{risks.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks.map((risk, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  risk.type === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : risk.type === 'warning'
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Badge
                    variant={
                      risk.type === 'error'
                        ? 'destructive'
                        : risk.type === 'warning'
                          ? 'outline'
                          : 'secondary'
                    }
                  >
                    {risk.type.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium">{risk.message}</div>
                    {risk.path && <div className="text-sm opacity-75 mt-1">{risk.path}</div>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {spec && risks.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No risks found. Your API spec looks good! ✅
          </CardContent>
        </Card>
      )}
    </div>
  );
}
