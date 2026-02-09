import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type OutputFormat = 'fetch' | 'axios';

export function CurlVisualizer() {
  const [curlCommand, setCurlCommand] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('fetch');
  const [converted, setConverted] = useState('');

  const convert = useCallback(() => {
    if (!curlCommand.trim()) {
      toast.error('Please enter a curl command');
      return;
    }

    try {
      // Simple curl parser (basic implementation)
      const urlMatch = curlCommand.match(/curl\s+['"]?([^'"]+)['"]?/);
      const methodMatch = curlCommand.match(/-X\s+(\w+)/);
      const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
      const dataMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);

      if (!urlMatch) {
        throw new Error('Could not find URL in curl command');
      }

      const url = urlMatch[1];
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
      const headers: Record<string, string> = {};
      const body = dataMatch ? dataMatch[1] : null;

      Array.from(headerMatches).forEach((match) => {
        const [key, value] = match[1].split(':').map((s) => s.trim());
        headers[key] = value;
      });

      let code = '';

      if (outputFormat === 'fetch') {
        code = `fetch('${url}', {\n`;
        code += `  method: '${method}',\n`;
        if (Object.keys(headers).length > 0) {
          code += `  headers: {\n`;
          Object.entries(headers).forEach(([key, value]) => {
            code += `    '${key}': '${value}',\n`;
          });
          code += `  },\n`;
        }
        if (body) {
          code += `  body: ${JSON.stringify(body)},\n`;
        }
        code += `});`;
      } else {
        code = `axios({\n`;
        code += `  url: '${url}',\n`;
        code += `  method: '${method}',\n`;
        if (Object.keys(headers).length > 0) {
          code += `  headers: {\n`;
          Object.entries(headers).forEach(([key, value]) => {
            code += `    '${key}': '${value}',\n`;
          });
          code += `  },\n`;
        }
        if (body) {
          code += `  data: ${JSON.stringify(body)},\n`;
        }
        code += `});`;
      }

      setConverted(code);
      toast.success('Converted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse curl command';
      toast.error(errorMessage);
      setConverted('');
    }
  }, [curlCommand, outputFormat]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(converted);
    toast.success('Copied to clipboard');
  }, [converted]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Curl Command Visualizer</CardTitle>
          <CardDescription>
            Parse curl commands, visualize headers/params/body, and convert to Fetch/Axios code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fetch">Fetch API</SelectItem>
              <SelectItem value="axios">Axios</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Paste your curl command here..."
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            className="font-mono text-sm"
            rows={6}
          />
          <Button onClick={convert} className="w-full">
            Convert
          </Button>
        </CardContent>
      </Card>

      {converted && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Converted Code</CardTitle>
              <Button onClick={copyCode} variant="outline" size="sm">
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
              {converted}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
