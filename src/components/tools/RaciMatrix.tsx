import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RaciLetter = '' | 'R' | 'A' | 'C' | 'I';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
}

export function RaciMatrix() {
  const [roles, setRoles] = useState(['Product Owner', 'Engineering', 'QA', 'Compliance']);
  const [tasks, setTasks] = useState<{ id: string; name: string; assignments: RaciLetter[] }[]>([
    {
      id: '1',
      name: 'Define acceptance criteria',
      assignments: ['A', 'R', 'C', 'I'],
    },
    {
      id: '2',
      name: 'Sign-off on release',
      assignments: ['A', 'C', 'R', 'I'],
    },
  ]);

  const setRoleName = useCallback((index: number, name: string) => {
    setRoles((r) => r.map((x, i) => (i === index ? name : x)));
  }, []);

  const addRole = useCallback(() => {
    setRoles((r) => [...r, `Role ${r.length + 1}`]);
    setTasks((t) =>
      t.map((row) => ({ ...row, assignments: [...row.assignments, '' as RaciLetter] }))
    );
  }, []);

  const removeRole = useCallback(
    (index: number) => {
      if (roles.length <= 1) return;
      setRoles((r) => r.filter((_, i) => i !== index));
      setTasks((t) =>
        t.map((row) => ({
          ...row,
          assignments: row.assignments.filter((_, i) => i !== index),
        }))
      );
    },
    [roles.length]
  );

  const addTask = useCallback(() => {
    const id = crypto.randomUUID();
    setTasks((t) => [...t, { id, name: '', assignments: roles.map(() => '' as RaciLetter) }]);
  }, [roles]);

  const updateTaskName = useCallback((id: string, name: string) => {
    setTasks((t) => t.map((row) => (row.id === id ? { ...row, name } : row)));
  }, []);

  const setAssignment = useCallback((taskId: string, col: number, letter: RaciLetter) => {
    setTasks((t) =>
      t.map((row) => {
        if (row.id !== taskId) return row;
        const next = [...row.assignments];
        next[col] = letter;
        return { ...row, assignments: next };
      })
    );
  }, []);

  const csv = useMemo(() => {
    const header = ['Task', ...roles];
    const body = tasks.map((row) => [row.name, ...row.assignments.map((a) => a || '-')]);
    return toCsv([header, ...body]);
  }, [roles, tasks]);

  const copyCsv = useCallback(() => {
    void navigator.clipboard.writeText(csv).then(
      () => toast.success('CSV copied'),
      () => toast.error('Copy failed')
    );
  }, [csv]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles (columns)</CardTitle>
          <CardDescription>
            One letter per task per role for Responsible, Accountable, Consulted, Informed (RACI): R
            = Responsible, A = Accountable, C = Consulted, I = Informed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {roles.map((role, i) => (
              <div key={i} className="flex items-center gap-1">
                <Input
                  value={role}
                  onChange={(e) => setRoleName(i, e.target.value)}
                  className="w-40 font-mono text-sm"
                />
                <Button type="button" size="sm" variant="ghost" onClick={() => removeRole(i)}>
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addRole}>
              Add role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks &amp; assignments</CardTitle>
          <CardDescription>Each row is a deliverable or activity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <div className="min-w-[640px] space-y-2">
            <div
              className="grid gap-2 font-medium text-sm"
              style={{ gridTemplateColumns: `2fr repeat(${roles.length}, minmax(5rem,1fr)) auto` }}
            >
              <div>Task</div>
              {roles.map((r, i) => (
                <div key={i} className="truncate text-xs text-muted-foreground" title={r}>
                  {r}
                </div>
              ))}
              <div />
            </div>
            {tasks.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 items-center"
                style={{
                  gridTemplateColumns: `2fr repeat(${roles.length}, minmax(5rem,1fr)) auto`,
                }}
              >
                <Input
                  value={row.name}
                  onChange={(e) => updateTaskName(row.id, e.target.value)}
                  placeholder="Task or deliverable"
                  className="font-mono text-sm"
                />
                {roles.map((_, col) => (
                  <Select
                    key={col}
                    value={row.assignments[col] || 'none'}
                    onValueChange={(v) =>
                      setAssignment(row.id, col, v === 'none' ? '' : (v as RaciLetter))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="R">R</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="I">I</SelectItem>
                    </SelectContent>
                  </Select>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setTasks((t) => t.filter((x) => x.id !== row.id))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addTask}>
            Add task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>
            Copy comma-separated values (CSV) for spreadsheets or Confluence tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
            {csv}
          </pre>
          <Button type="button" onClick={copyCsv}>
            Copy CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
