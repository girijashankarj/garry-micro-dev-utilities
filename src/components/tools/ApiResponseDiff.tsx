import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ApiResponseDiff() {
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [diff, setDiff] = useState<{
    added: string[];
    removed: string[];
    modified: string[];
  } | null>(null);

  const compare = useCallback(() => {
    if (!response1.trim() || !response2.trim()) {
      toast.error('Please enter both responses');
      return;
    }

    try {
      const obj1 = JSON.parse(response1);
      const obj2 = JSON.parse(response2);

      const added: string[] = [];
      const removed: string[] = [];
      const modified: string[] = [];

      const compareObjects = (obj1: unknown, obj2: unknown, path = '') => {
        if (
          typeof obj1 !== 'object' ||
          obj1 === null ||
          typeof obj2 !== 'object' ||
          obj2 === null
        ) {
          return;
        }
        const o1 = obj1 as Record<string, unknown>;
        const o2 = obj2 as Record<string, unknown>;
        const keys1 = Object.keys(o1);
        const keys2 = Object.keys(o2);

        keys1.forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in o2)) {
            removed.push(currentPath);
          } else if (JSON.stringify(o1[key]) !== JSON.stringify(o2[key])) {
            if (
              typeof o1[key] === 'object' &&
              typeof o2[key] === 'object' &&
              o1[key] !== null &&
              o2[key] !== null
            ) {
              compareObjects(o1[key], o2[key], currentPath);
            } else {
              modified.push(currentPath);
            }
          }
        });

        keys2.forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in o1)) {
            added.push(currentPath);
          }
        });
      };

      compareObjects(obj1, obj2);

      setDiff({ added, removed, modified });
      toast.success('Comparison complete');
    } catch {
      toast.error('Failed to parse JSON responses');
      setDiff(null);
    }
  }, [response1, response2]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application programming interface (API) response diff</CardTitle>
          <CardDescription>
            Compare two JSON (JavaScript Object Notation) API responses and highlight semantic
            differences and breaking changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Response 1</label>
            <Textarea
              placeholder="Paste first JSON response..."
              value={response1}
              onChange={(e) => setResponse1(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Response 2</label>
            <Textarea
              placeholder="Paste second JSON response..."
              value={response2}
              onChange={(e) => setResponse2(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
          </div>
          <Button onClick={compare} className="w-full">
            Compare Responses
          </Button>
        </CardContent>
      </Card>

      {diff && (
        <Card>
          <CardHeader>
            <CardTitle>Differences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diff.added.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">Added ({diff.added.length})</Badge>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {diff.added.map((path) => (
                    <li key={path} className="text-green-600 dark:text-green-400">
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {diff.removed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive">Removed ({diff.removed.length})</Badge>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {diff.removed.map((path) => (
                    <li key={path} className="text-red-600 dark:text-red-400">
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {diff.modified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Modified ({diff.modified.length})</Badge>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {diff.modified.map((path) => (
                    <li key={path} className="text-yellow-600 dark:text-yellow-400">
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
              <div className="text-center text-muted-foreground py-4">No differences found</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
