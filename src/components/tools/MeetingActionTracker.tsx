import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ActionRow = {
  id: string;
  item: string;
  owner: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'done';
};

function toMarkdown(notes: string, actions: ActionRow[]): string {
  const lines: string[] = [
    '## Meeting notes',
    '',
    notes.trim() || '_No notes._',
    '',
    '## Action items',
    '',
  ];
  if (actions.length === 0) {
    lines.push('_None._');
  } else {
    lines.push('| Item | Owner | Due | Status |');
    lines.push('| --- | --- | --- | --- |');
    for (const a of actions) {
      lines.push(
        `| ${a.item.replace(/\|/g, '\\|')} | ${a.owner} | ${a.dueDate || '—'} | ${a.status} |`
      );
    }
  }
  return lines.join('\n');
}

export function MeetingActionTracker() {
  const [notes, setNotes] = useState(
    'Discussed Q2 scope. Need sign-off on integrations by Friday.\n- Follow up with legal on DPA.'
  );
  const [actions, setActions] = useState<ActionRow[]>([
    {
      id: '1',
      item: 'Send revised timeline to stakeholders',
      owner: 'PM',
      dueDate: '',
      status: 'open',
    },
  ]);

  const updateAction = useCallback((id: string, patch: Partial<ActionRow>) => {
    setActions((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const addAction = useCallback(() => {
    setActions((r) => [
      ...r,
      { id: crypto.randomUUID(), item: '', owner: '', dueDate: '', status: 'open' },
    ]);
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions((r) => r.filter((x) => x.id !== id));
  }, []);

  const parseBulletLines = useCallback(() => {
    const lines = notes.split(/\r?\n/);
    const bullets = lines
      .map((l) => l.trim())
      .filter((l) => /^[-*]\s+/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, ''));
    if (bullets.length === 0) {
      toast.info('No bullet lines found (use lines starting with - or *)');
      return;
    }
    setActions((prev) => [
      ...prev,
      ...bullets.map((item) => ({
        id: crypto.randomUUID(),
        item,
        owner: '',
        dueDate: '',
        status: 'open' as const,
      })),
    ]);
    toast.success(`Added ${bullets.length} action(s) from bullets`);
  }, [notes]);

  const md = useMemo(() => toMarkdown(notes, actions), [notes, actions]);

  const copyMd = useCallback(() => {
    void navigator.clipboard.writeText(md).then(
      () => toast.success('Markdown copied'),
      () => toast.error('Copy failed')
    );
  }, [md]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meeting notes</CardTitle>
          <CardDescription>
            Free-form notes. Use bullet lines (- or *) and “Import bullets to actions” to seed the
            table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-40 text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={parseBulletLines}>
            Import bullets to actions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action items</CardTitle>
          <CardDescription>Track owners, due dates, and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((row) => (
            <div
              key={row.id}
              className="grid gap-2 sm:grid-cols-12 items-end rounded-md border p-3"
            >
              <div className="sm:col-span-5">
                <label className="text-xs text-muted-foreground">Item</label>
                <Input
                  value={row.item}
                  onChange={(e) => updateAction(row.id, { item: e.target.value })}
                  placeholder="Action"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Owner</label>
                <Input
                  value={row.owner}
                  onChange={(e) => updateAction(row.id, { owner: e.target.value })}
                  placeholder="Name / role"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Due</label>
                <Input
                  type="date"
                  value={row.dueDate}
                  onChange={(e) => updateAction(row.id, { dueDate: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select
                  value={row.status}
                  onValueChange={(v) => updateAction(row.id, { status: v as ActionRow['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAction(row.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addAction}>
            Add action
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Markdown export</CardTitle>
          <CardDescription>Single document for Confluence, GitHub, or email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
            {md}
          </pre>
          <Button type="button" onClick={copyMd}>
            Copy Markdown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
