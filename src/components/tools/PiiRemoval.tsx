import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip, Tooltip } from '@/components/ui/tooltip';
import { toast } from 'sonner';

type MatchType = 'complete' | 'substring';
type CaseSensitive = 'case-sensitive' | 'case-insensitive';
type WordBoundary = 'word-boundary' | 'no-word-boundary';

export function PiiRemoval() {
  const [content, setContent] = useState('');
  const [fileType, setFileType] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [fileExtension, setFileExtension] = useState<string>('.txt');
  const [keywords, setKeywords] = useState('');
  const [maskPattern, setMaskPattern] = useState('[REDACTED]');
  const [matchType, setMatchType] = useState<MatchType>('substring');
  const [caseSensitive, setCaseSensitive] = useState<CaseSensitive>('case-insensitive');
  const [wordBoundary, setWordBoundary] = useState<WordBoundary>('no-word-boundary');
  const [matches, setMatches] = useState<Array<{ keyword: string; count: number }>>([]);
  const [maskedContent, setMaskedContent] = useState<string>('');

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || '';
    
    // Store original file name and extension for download
    setOriginalFileName(file.name);
    setFileExtension(ext ? `.${ext}` : '.txt');
    
    // Determine file type
    let detectedType = 'Unknown';
    if (ext === 'json' || mimeType.includes('json')) {
      detectedType = 'JSON';
    } else if (ext === 'csv' || mimeType.includes('csv')) {
      detectedType = 'CSV';
    } else if (ext === 'yaml' || ext === 'yml' || mimeType.includes('yaml')) {
      detectedType = 'YAML';
    } else if (ext === 'txt' || mimeType.includes('text')) {
      detectedType = 'Text';
    } else if (ext === 'md' || mimeType.includes('markdown')) {
      detectedType = 'Markdown';
    } else if (ext === 'log') {
      detectedType = 'Log File';
    } else {
      detectedType = ext.toUpperCase() || 'Unknown';
    }

    setFileType(`${detectedType} (${file.name}, ${(file.size / 1024).toFixed(2)} KB)`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      toast.success('File loaded successfully');
    };
    reader.readAsText(file);
  }, []);

  const keywordList = useMemo(() => {
    return keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }, [keywords]);

  const buildPattern = useCallback((keyword: string): RegExp => {
    // Escape special regex characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Build pattern based on match type
    let pattern: string;
    
    if (matchType === 'complete') {
      // Complete string match - exact match only
      if (wordBoundary === 'word-boundary') {
        pattern = `\\b${escapedKeyword}\\b`;
      } else {
        pattern = escapedKeyword;
      }
    } else {
      // Substring match - can match part of a word
      if (wordBoundary === 'word-boundary') {
        pattern = `\\b${escapedKeyword}`;
      } else {
        pattern = escapedKeyword;
      }
    }
    
    // Build regex flags
    const flags = caseSensitive === 'case-insensitive' ? 'gi' : 'g';
    
    return new RegExp(pattern, flags);
  }, [matchType, caseSensitive, wordBoundary]);

  const findMatches = useCallback(() => {
    if (!content.trim() || keywordList.length === 0) {
      toast.error('Please provide content and keywords');
      return;
    }

    const foundMatches: Array<{ keyword: string; count: number }> = [];

    keywordList.forEach((keyword) => {
      // Pattern 1: Find keyword followed by colon/equals and value (e.g., "name: John", "id=123")
      // This finds the VALUES after keywords
      const pattern1 = buildPattern(keyword);
      const pattern1WithValue = new RegExp(
        `${pattern1.source}\\s*[:=]\\s*([^\\s,;\\n"']+)`,
        pattern1.flags
      );
      const matches1 = Array.from(content.matchAll(pattern1WithValue));
      const count1 = matches1.length;
      
      // Pattern 2: Find keyword in JSON-like structures (e.g., "name": "John")
      const pattern2 = new RegExp(
        `"${pattern1.source}"\\s*:\\s*"([^"]+)"`,
        pattern1.flags
      );
      const matches2 = Array.from(content.matchAll(pattern2));
      const count2 = matches2.length;
      
      // Pattern 3: Find keyword in quotes after colon (e.g., name: "John")
      const pattern3 = new RegExp(
        `${pattern1.source}\\s*:\\s*"([^"]+)"`,
        pattern1.flags
      );
      const matches3 = Array.from(content.matchAll(pattern3));
      const count3 = matches3.length;
      
      // Also search for the keyword itself if it's a substring match
      let count4 = 0;
      if (matchType === 'substring') {
        const directPattern = buildPattern(keyword);
        const directMatches = Array.from(content.matchAll(directPattern));
        count4 = directMatches.length;
      }
      
      // Total count (avoid double counting by taking max)
      const totalCount = Math.max(count1, count2, count3, count4);
      
      if (totalCount > 0) {
        foundMatches.push({ keyword, count: totalCount });
      }
    });

    setMatches(foundMatches);
    const totalMatches = foundMatches.reduce((sum, m) => sum + m.count, 0);
    if (totalMatches > 0) {
      toast.success(`Found ${totalMatches} match${totalMatches !== 1 ? 'es' : ''}`);
    } else {
      toast.info('No matches found');
    }
  }, [content, keywordList, buildPattern, matchType]);

  const applyMasking = useCallback(() => {
    if (!content.trim() || keywordList.length === 0) {
      toast.error('Please provide content and keywords');
      return;
    }

    let masked = content;
    let totalReplaced = 0;

    keywordList.forEach((keyword) => {
      // Pattern 1: Replace values after keyword:value or keyword=value
      // e.g., "name: John" -> "name: [REDACTED]"
      const pattern1 = buildPattern(keyword);
      const pattern1WithValue = new RegExp(
        `${pattern1.source}\\s*[:=]\\s*([^\\s,;\\n"']+)`,
        pattern1.flags
      );
      const matches1 = Array.from(masked.matchAll(pattern1WithValue));
      totalReplaced += matches1.length;
      masked = masked.replace(pattern1WithValue, (match, value) => {
        return match.replace(value, maskPattern);
      });
      
      // Pattern 2: Replace values in JSON-like structures
      // e.g., "name": "John" -> "name": "[REDACTED]"
      const pattern2 = new RegExp(
        `"${pattern1.source}"\\s*:\\s*"([^"]+)"`,
        pattern1.flags
      );
      const matches2 = Array.from(masked.matchAll(pattern2));
      totalReplaced += matches2.length;
      masked = masked.replace(pattern2, (match, value) => {
        return match.replace(`"${value}"`, `"${maskPattern}"`);
      });
      
      // Pattern 3: Replace values in quotes after colon
      // e.g., name: "John" -> name: "[REDACTED]"
      const pattern3 = new RegExp(
        `${pattern1.source}\\s*:\\s*"([^"]+)"`,
        pattern1.flags
      );
      const matches3 = Array.from(masked.matchAll(pattern3));
      totalReplaced += matches3.length;
      masked = masked.replace(pattern3, (match, value) => {
        return match.replace(`"${value}"`, `"${maskPattern}"`);
      });

      // Pattern 4: Direct keyword replacement (for substring matches)
      if (matchType === 'substring') {
        const directPattern = buildPattern(keyword);
        const directMatches = Array.from(masked.matchAll(directPattern));
        totalReplaced += directMatches.length;
        masked = masked.replace(directPattern, maskPattern);
      }
    });

    setMaskedContent(masked);
    if (totalReplaced > 0) {
      toast.success(`Masked ${totalReplaced} occurrence${totalReplaced !== 1 ? 's' : ''}`);
    } else {
      toast.info('No matches found to mask');
    }
  }, [content, keywordList, maskPattern, buildPattern, matchType]);

  const downloadMasked = useCallback(() => {
    if (!maskedContent) {
      toast.error('No masked content to download');
      return;
    }

    // Determine MIME type based on file extension
    let mimeType = 'text/plain';
    const ext = fileExtension.toLowerCase();
    if (ext === '.json') {
      mimeType = 'application/json';
    } else if (ext === '.csv') {
      mimeType = 'text/csv';
    } else if (ext === '.yaml' || ext === '.yml') {
      mimeType = 'text/yaml';
    } else if (ext === '.md') {
      mimeType = 'text/markdown';
    } else if (ext === '.log') {
      mimeType = 'text/plain';
    }

    // Create blob with appropriate MIME type
    const blob = new Blob([maskedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate download filename
    let downloadName: string;
    if (originalFileName) {
      // Use original filename with "masked-" prefix
      const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
      downloadName = `masked-${nameWithoutExt}${fileExtension}`;
    } else {
      // Use timestamp if no original filename
      downloadName = `masked-content-${Date.now()}${fileExtension}`;
    }
    
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${downloadName}`);
  }, [maskedContent, originalFileName, fileExtension]);

  const copyMasked = useCallback(() => {
    if (!maskedContent) {
      toast.error('No masked content to copy');
      return;
    }
    navigator.clipboard.writeText(maskedContent);
    toast.success('Copied to clipboard');
  }, [maskedContent]);

  const totalMatches = useMemo(() => {
    return matches.reduce((sum, m) => sum + m.count, 0);
  }, [matches]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>PII Removal Tool</CardTitle>
            <InfoTooltip content="Safely identify and mask Personally Identifiable Information (PII) like names, IDs, emails, phone numbers, and account details. Configure matching options for precise control over what gets masked." />
          </div>
          <CardDescription>
            Identify and mask Personally Identifiable Information (PII) from files. Enter keywords to
            find and mask sensitive data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Upload File</label>
              <InfoTooltip content="Upload files containing sensitive data. Supported formats: TXT, JSON, YAML, CSV, Markdown, and log files. The tool will identify and mask values associated with your keywords." />
            </div>
            <FileInput
              accept=".txt,.json,.yaml,.yml,.csv,.md,.log"
              onChange={handleFileUpload}
            />
          </div>
          {fileType && (
            <div className="p-3 bg-muted/50 rounded-md border border-border">
              <div className="text-sm font-medium text-foreground mb-1">File Identified:</div>
              <div className="text-sm text-muted-foreground">{fileType}</div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">Or paste content directly</label>
            <Textarea
              placeholder="Paste your content here..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                // Reset file info when pasting content
                if (e.target.value && !originalFileName) {
                  setFileExtension('.txt');
                }
              }}
              className="font-mono text-sm min-h-32"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">
                Keywords to find (comma-separated)
              </label>
              <InfoTooltip content="Enter keywords that identify PII fields. The tool finds and masks the VALUES associated with these keywords. Example: 'name, email, phone' will mask values like 'name: John' → 'name: [REDACTED]'." />
            </div>
            <Input
              placeholder="e.g., name, id, account, email, phone, ssn"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter keywords separated by commas (e.g., name, id, account, email). The tool will find and mask the VALUES associated with these keywords (e.g., "name: John" will mask "John").
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Match Type</label>
                <InfoTooltip content="Complete String: Matches only exact keyword matches. Substring: Matches keywords that appear as part of larger words or phrases." />
              </div>
              <Select value={matchType} onValueChange={(value: MatchType) => setMatchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete String</SelectItem>
                  <SelectItem value="substring">Substring</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Complete: exact match only. Substring: matches part of text.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Case Sensitivity</label>
                <InfoTooltip content="Case Insensitive: Matches 'Name', 'name', and 'NAME' all the same. Case Sensitive: Only matches the exact case you specify." />
              </div>
              <Select value={caseSensitive} onValueChange={(value: CaseSensitive) => setCaseSensitive(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case-insensitive">Case Insensitive</SelectItem>
                  <SelectItem value="case-sensitive">Case Sensitive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Whether to match case exactly or ignore case.
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Word Boundary</label>
                <InfoTooltip content="Word Boundary: 'name' matches 'name' but not 'username' or 'surname'. No Word Boundary: 'name' matches anywhere, including within other words." />
              </div>
              <Select value={wordBoundary} onValueChange={(value: WordBoundary) => setWordBoundary(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-word-boundary">No Word Boundary</SelectItem>
                  <SelectItem value="word-boundary">Word Boundary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Match at word boundaries (e.g., "name" won't match "username").
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Mask pattern</label>
              <InfoTooltip content="The text that will replace matched PII values. Common patterns: [REDACTED], [REDACTED_NAME], XXXX, ***, or [MASKED]. You can customize this to match your organization's standards." />
            </div>
            <Input
              placeholder="[REDACTED]"
              value={maskPattern}
              onChange={(e) => setMaskPattern(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pattern to replace matched keywords with (e.g., [REDACTED_NAME], XXXX, ***)
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Tooltip content="Search for keywords and count how many matches are found without modifying the content">
                <Button onClick={findMatches} className="w-full">
                  Find Matches
                </Button>
              </Tooltip>
            </div>
            <div className="flex-1">
              <Tooltip content="Apply masking to all matched values. The masked content will be available for download or copy.">
                <Button onClick={applyMasking} variant="outline" className="w-full" disabled={!content}>
                  Apply Masking
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Results</CardTitle>
            <CardDescription>
              Found {totalMatches} total match{totalMatches !== 1 ? 'es' : ''} across {matches.length}{' '}
              keyword{matches.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{match.keyword}</Badge>
                  </div>
                  <div className="text-sm font-semibold">{match.count} match{match.count !== 1 ? 'es' : ''}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {maskedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Masked Content</CardTitle>
                <CardDescription>
                  Content with PII masked. Ready to download as{' '}
                  <code className="bg-muted px-1 rounded text-xs">
                    {originalFileName ? `masked-${originalFileName.replace(/\.[^/.]+$/, '')}${fileExtension}` : `masked-content${fileExtension}`}
                  </code>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyMasked} variant="outline" size="sm">
                  Copy
                </Button>
                <Button onClick={downloadMasked} variant="default" size="sm">
                  Download File
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={maskedContent}
              readOnly
              className="font-mono text-sm min-h-48"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
