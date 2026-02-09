import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';
import { toast } from 'sonner';

export function CsvExplorer() {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter((line) => line.trim());
        const parsed: string[][] = [];

        lines.forEach((line) => {
          const row: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              row.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          row.push(current.trim());
          parsed.push(row);
        });

        if (parsed.length > 0) {
          setHeaders(parsed[0]);
          setCsvData(parsed.slice(1));
          toast.success('CSV loaded successfully');
        }
      } catch (err) {
        toast.error('Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return csvData;
    return csvData.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [csvData, searchTerm]);

  const exportToJson = useCallback(() => {
    const json = filteredData.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to JSON');
  }, [filteredData, headers]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Explorer</CardTitle>
          <CardDescription>
            Upload CSV files, render as sortable table, search/filter rows, export to JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileInput accept=".csv" onChange={handleFileUpload} />
          {csvData.length > 0 && (
            <>
              <Input
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={exportToJson} variant="outline" className="w-full">
                Export to JSON
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Data ({filteredData.length} of {csvData.length} rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    {headers.map((header, index) => (
                      <th key={index} className="text-left p-2 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-muted/50">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
