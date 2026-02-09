import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ApiResponseDiff() {
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [diff, setDiff] = useState<{ added: string[]; removed: string[]; modified: string[] } | null>(
    null
  );

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

      const compareObjects = (obj1: any, obj2: any, path = '') => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        keys1.forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in obj2)) {
            removed.push(currentPath);
          } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
              compareObjects(obj1[key], obj2[key], currentPath);
            } else {
              modified.push(currentPath);
            }
          }
        });

        keys2.forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (!(key in obj1)) {
            added.push(currentPath);
          }
        });
      };

      compareObjects(obj1, obj2);

      setDiff({ added, removed, modified });
      toast.success('Comparison complete');
    } catch (err) {
      toast.error('Failed to parse JSON responses');
      setDiff(null);
    }
  }, [response1, response2]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Response Diff</CardTitle>
          <CardDescription>
            Compare two JSON API responses and highlight semantic differences and breaking changes
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
              <div className="text-center text-muted-foreground py-4">
                No differences found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
