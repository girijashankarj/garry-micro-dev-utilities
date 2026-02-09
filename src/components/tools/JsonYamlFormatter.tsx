import { useState, useCallback } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Format = 'json' | 'yaml';

export function JsonYamlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inputFormat, setInputFormat] = useState<Format>('json');
  const [outputFormat, setOutputFormat] = useState<Format>('json');
  const [error, setError] = useState<string | null>(null);

  const format = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      let parsed: any;

      // Parse input
      if (inputFormat === 'json') {
        parsed = JSON.parse(input);
      } else {
        parsed = yaml.load(input);
      }

      // Convert to output format
      if (outputFormat === 'json') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(yaml.dump(parsed, { indent: 2 }));
      }

      setError(null);
      toast.success('Formatted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse content';
      setError(errorMessage);
      setOutput('');
      toast.error('Failed to format');
    }
  }, [input, inputFormat, outputFormat]);

  const minify = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      let parsed: any;

      if (inputFormat === 'json') {
        parsed = JSON.parse(input);
      } else {
        parsed = yaml.load(input);
      }

      setOutput(JSON.stringify(parsed));
      setError(null);
      toast.success('Minified successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to minify';
      setError(errorMessage);
      toast.error('Failed to minify');
    }
  }, [input, inputFormat]);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  }, [output]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JSON / YAML Formatter</CardTitle>
          <CardDescription>
            Format, validate, minify JSON/YAML. Convert between formats. Copy formatted output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={inputFormat} onValueChange={(v) => setInputFormat(v as Format)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectContent>
            </Select>
            <span className="self-center text-muted-foreground">→</span>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as Format)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder={`Paste your ${inputFormat.toUpperCase()} here...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm"
            rows={10}
          />
          <div className="flex gap-2">
            <Button onClick={format} className="flex-1">
              Format
            </Button>
            <Button onClick={minify} variant="outline" className="flex-1">
              Minify
            </Button>
          </div>
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Formatted Output</CardTitle>
              <Button onClick={copyOutput} variant="outline" size="sm">
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
