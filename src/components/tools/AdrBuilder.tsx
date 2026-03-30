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

function buildAdrMarkdown(fields: {
  number: string;
  title: string;
  status: string;
  date: string;
  context: string;
  decision: string;
  consequences: string;
}): string {
  const n = fields.number.trim() || '0001';
  const slug =
    fields.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled';
  return [
    `# ADR-${n}: ${fields.title.trim() || 'Title'}`,
    '',
    `**Status:** ${fields.status}  `,
    `**Date:** ${fields.date}`,
    '',
    '## Context',
    '',
    fields.context.trim() || '_Describe the forces at play (business, technical, constraints)._',
    '',
    '## Decision',
    '',
    fields.decision.trim() || '_State the decision clearly._',
    '',
    '## Consequences',
    '',
    fields.consequences.trim() || '_Positive, negative, and follow-up work._',
    '',
    '---',
    '',
    `**Suggested filename:** \`${n}-${slug}.md\``,
  ].join('\n');
}

export function AdrBuilder() {
  const [number, setNumber] = useState('0001');
  const [title, setTitle] = useState('Use PostgreSQL for primary transactional store');
  const [status, setStatus] = useState('Accepted');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [context, setContext] = useState(
    'We need durable ACID semantics and team familiarity. We are evaluating Postgres vs managed document stores.'
  );
  const [decision, setDecision] = useState(
    'We will standardize on PostgreSQL 15+ for OLTP workloads in this program.'
  );
  const [consequences, setConsequences] = useState(
    'Positive: strong ecosystem, SQL tooling. Negative: operational expertise required for HA. Follow-up: runbooks and backup strategy.'
  );

  const markdown = useMemo(
    () => buildAdrMarkdown({ number, title, status, date, context, decision, consequences }),
    [number, title, status, date, context, decision, consequences]
  );

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(markdown).then(
      () => toast.success('Architecture Decision Record (ADR) Markdown copied'),
      () => toast.error('Copy failed')
    );
  }, [markdown]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Architecture Decision Record (ADR) fields</CardTitle>
          <CardDescription>
            Architecture Decision Record (Michael Nygard style). Copy Markdown into your repo’s
            docs/adr folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Architecture Decision Record (ADR) number
              </label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="0001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proposed">Proposed</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
                <SelectItem value="Superseded">Superseded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Context</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={5}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Decision</label>
            <Textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={4}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Consequences</label>
            <Textarea
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              rows={5}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="max-h-96 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap">
            {markdown}
          </pre>
          <Button type="button" onClick={copy}>
            Copy Markdown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
