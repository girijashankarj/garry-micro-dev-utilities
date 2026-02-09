import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function SqlExplainer() {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState<{
    joins: string[];
    filters: string[];
    tables: string[];
    warnings: string[];
  } | null>(null);

  const analyze = useCallback(() => {
    if (!query.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    const sql = query.toLowerCase();
    const joins: string[] = [];
    const filters: string[] = [];
    const tables: string[] = [];
    const warnings: string[] = [];

    // Extract JOINs
    const joinMatches = sql.matchAll(/(?:inner|left|right|full|outer)?\s+join\s+(\w+)/gi);
    Array.from(joinMatches).forEach((match) => {
      joins.push(match[1]);
    });

    // Extract tables from FROM clause
    const fromMatch = sql.match(/from\s+(\w+)/i);
    if (fromMatch) {
      tables.push(fromMatch[1]);
    }

    // Extract WHERE conditions
    const whereMatch = sql.match(/where\s+(.+?)(?:\s+group|\s+order|\s+limit|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+and\s+|\s+or\s+/i);
      conditions.forEach((cond) => {
        if (cond.trim()) filters.push(cond.trim());
      });
    }

    // Detect potential issues
    if (sql.includes('select *')) {
      warnings.push('Using SELECT * may impact performance');
    }
    if (sql.includes('like') && !sql.includes('%')) {
      warnings.push('LIKE without wildcard may not work as expected');
    }
    if (joins.length > 3) {
      warnings.push('Multiple joins detected - consider query performance');
    }
    if (!sql.includes('limit') && sql.includes('select')) {
      warnings.push('No LIMIT clause - query may return large result set');
    }

    setAnalysis({ joins, filters, tables, warnings });
    toast.success('Analysis complete');
  }, [query]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SQL Query Explainer</CardTitle>
          <CardDescription>
            Explain SQL queries without execution. Detect joins, filters, and potential performance issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your SQL query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="font-mono text-sm"
            rows={8}
          />
          <Button onClick={analyze} className="w-full">
            Analyze Query
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Query Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.tables.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Tables:</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tables.map((table, index) => (
                      <Badge key={index} variant="secondary">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.joins.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Joins:</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.joins.map((join, index) => (
                      <Badge key={index} variant="outline">
                        {join}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.filters.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Filters:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {analysis.filters.map((filter, index) => (
                      <li key={index} className="text-muted-foreground">
                        {filter}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.warnings.length > 0 && (
                <div>
                  <div className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
                    Warnings:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {analysis.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-600 dark:text-yellow-400">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
