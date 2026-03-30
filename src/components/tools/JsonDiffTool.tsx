import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type DiffItem = {
  path: string;
  leftValue: string;
  rightValue: string;
  type: 'added' | 'removed' | 'changed';
};

function parseLooseJson(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Input is empty');
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Allows JavaScript object literals without third-party packages.
    // Example: { name: 'john', age: 22 }
    return Function(`"use strict"; return (${trimmed});`)();
  }
}

function toPrettyString(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function getJsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function createDiff(left: unknown, right: unknown, basePath = '$'): DiffItem[] {
  const leftType = getJsonType(left);
  const rightType = getJsonType(right);

  if (leftType !== rightType) {
    return [
      {
        path: basePath,
        leftValue: JSON.stringify(left),
        rightValue: JSON.stringify(right),
        type: 'changed',
      },
    ];
  }

  if (leftType !== 'object' && leftType !== 'array') {
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return [
        {
          path: basePath,
          leftValue: JSON.stringify(left),
          rightValue: JSON.stringify(right),
          type: 'changed',
        },
      ];
    }
    return [];
  }

  const diffs: DiffItem[] = [];

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i += 1) {
      const currentPath = `${basePath}[${i}]`;
      if (i >= left.length) {
        diffs.push({
          path: currentPath,
          leftValue: '(missing)',
          rightValue: JSON.stringify(right[i]),
          type: 'added',
        });
      } else if (i >= right.length) {
        diffs.push({
          path: currentPath,
          leftValue: JSON.stringify(left[i]),
          rightValue: '(missing)',
          type: 'removed',
        });
      } else {
        diffs.push(...createDiff(left[i], right[i], currentPath));
      }
    }
    return diffs;
  }

  const leftObject = left as Record<string, unknown>;
  const rightObject = right as Record<string, unknown>;
  const keys = new Set([...Object.keys(leftObject), ...Object.keys(rightObject)]);

  keys.forEach((key) => {
    const currentPath = `${basePath}.${key}`;
    const hasLeft = Object.prototype.hasOwnProperty.call(leftObject, key);
    const hasRight = Object.prototype.hasOwnProperty.call(rightObject, key);

    if (!hasLeft) {
      diffs.push({
        path: currentPath,
        leftValue: '(missing)',
        rightValue: JSON.stringify(rightObject[key]),
        type: 'added',
      });
      return;
    }

    if (!hasRight) {
      diffs.push({
        path: currentPath,
        leftValue: JSON.stringify(leftObject[key]),
        rightValue: '(missing)',
        type: 'removed',
      });
      return;
    }

    diffs.push(...createDiff(leftObject[key], rightObject[key], currentPath));
  });

  return diffs;
}

export function JsonDiffTool() {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [leftParsed, setLeftParsed] = useState<unknown | null>(null);
  const [rightParsed, setRightParsed] = useState<unknown | null>(null);
  const [hasCompared, setHasCompared] = useState(false);

  const diffResult = useMemo(() => {
    if (!hasCompared || leftParsed === null || rightParsed === null) {
      return [];
    }
    return createDiff(leftParsed, rightParsed);
  }, [hasCompared, leftParsed, rightParsed]);

  const parseAndSet = (value: string, side: 'left' | 'right') => {
    try {
      const parsed = parseLooseJson(value);
      if (side === 'left') {
        setLeftParsed(parsed);
      } else {
        setRightParsed(parsed);
      }
      return parsed;
    } catch {
      toast.error(`Invalid ${side} JSON/JS object`);
      return null;
    }
  };

  const handleCompare = () => {
    const left = parseAndSet(leftInput, 'left');
    const right = parseAndSet(rightInput, 'right');
    if (left === null || right === null) return;
    setHasCompared(true);
    toast.success('Diff generated');
  };

  const handleFormat = (side: 'left' | 'right') => {
    const currentValue = side === 'left' ? leftInput : rightInput;
    const parsed = parseAndSet(currentValue, side);
    if (parsed === null) return;

    const formatted = toPrettyString(parsed);
    if (side === 'left') {
      setLeftInput(formatted);
    } else {
      setRightInput(formatted);
    }
    toast.success(`${side === 'left' ? 'Left' : 'Right'} formatted`);
  };

  const handleConvertJsObjectToJson = (side: 'left' | 'right') => {
    const currentValue = side === 'left' ? leftInput : rightInput;
    const parsed = parseAndSet(currentValue, side);
    if (parsed === null) return;

    const converted = toPrettyString(parsed);
    if (side === 'left') {
      setLeftInput(converted);
    } else {
      setRightInput(converted);
    }
    toast.success(`${side === 'left' ? 'Left' : 'Right'} converted to JSON`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JavaScript Object Notation (JSON) diff (fixed left / right)</CardTitle>
          <CardDescription>
            Compare two JSON payloads side-by-side. Supports formatting and JavaScript object to
            JSON conversion on both panels without third-party parsing packages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Left Input</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleFormat('left')}>
                    Format Left
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertJsObjectToJson('left')}
                  >
                    JS Object → JSON
                  </Button>
                </div>
              </div>
              <Textarea
                value={leftInput}
                onChange={(e) => setLeftInput(e.target.value)}
                placeholder="Paste left JSON or JS object..."
                className="font-mono text-sm min-h-72"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Right Input</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleFormat('right')}>
                    Format Right
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertJsObjectToJson('right')}
                  >
                    JS Object → JSON
                  </Button>
                </div>
              </div>
              <Textarea
                value={rightInput}
                onChange={(e) => setRightInput(e.target.value)}
                placeholder="Paste right JSON or JS object..."
                className="font-mono text-sm min-h-72"
              />
            </div>
          </div>

          <Button onClick={handleCompare} className="w-full">
            Compare Left vs Right
          </Button>
        </CardContent>
      </Card>

      {hasCompared && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Result</CardTitle>
            <CardDescription>
              {diffResult.length === 0
                ? 'No differences detected'
                : `${diffResult.length} difference(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {diffResult.length === 0 ? (
              <p className="text-sm text-muted-foreground">Left and right are identical.</p>
            ) : (
              <div className="space-y-2">
                {diffResult.map((item) => (
                  <div
                    key={`${item.path}-${item.type}`}
                    className="rounded border p-3 text-sm space-y-1"
                  >
                    <div className="font-semibold">{item.path}</div>
                    <div className="text-muted-foreground">Type: {item.type}</div>
                    <div className="font-mono">Left: {item.leftValue}</div>
                    <div className="font-mono">Right: {item.rightValue}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
