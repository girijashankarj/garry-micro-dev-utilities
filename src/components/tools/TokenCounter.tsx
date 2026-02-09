import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip, Tooltip } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Lazy load gpt-tokenizer to handle import errors gracefully
let encodeFn: ((text: string) => number[]) | null = null;
let decodeFn: ((tokens: number[]) => string) | null = null;
let tokenizerLoaded = false;
let tokenizerError: string | null = null;

async function loadTokenizer() {
  if (tokenizerLoaded) return;
  
  try {
    const tokenizer = await import('gpt-tokenizer/encoding/cl100k_base');
    encodeFn = tokenizer.encode;
    decodeFn = tokenizer.decode;
    tokenizerLoaded = true;
    tokenizerError = null;
  } catch (err) {
    tokenizerError = err instanceof Error ? err.message : 'Failed to load tokenizer';
    console.error('Failed to load gpt-tokenizer:', err);
  }
}

interface TokenSegment {
  text: string;
  tokenIndex: number;
  startIndex: number;
  endIndex: number;
}

export function TokenCounter() {
  const [content, setContent] = useState('');
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [tokenSegments, setTokenSegments] = useState<TokenSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokenizer on mount
  useEffect(() => {
    loadTokenizer().then(() => {
      setIsLoading(false);
      if (tokenizerError) {
        toast.error(`Tokenizer not available: ${tokenizerError}. Please run 'npm install' to install gpt-tokenizer.`);
      }
    });
  }, []);

  const countTokens = useCallback((text: string) => {
    if (!encodeFn || !decodeFn) {
      if (tokenizerError) {
        toast.error('Tokenizer not loaded. Please install gpt-tokenizer: npm install');
      } else {
        toast.error('Tokenizer is still loading...');
      }
      return;
    }

    try {
      // Use cl100k_base encoding (used by GPT-4, GPT-3.5-turbo, etc.)
      const tokens = encodeFn(text);
      setTokenCount(tokens.length);
      
      // Create token segments by matching decoded tokens to original text
      // Decode all tokens and reconstruct to find accurate positions
      const segments: TokenSegment[] = [];
      let currentPos = 0;
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const decodedToken = decodeFn([token]);
        
        // Find the decoded token in the remaining text
        const searchStart = currentPos;
        const foundIndex = text.indexOf(decodedToken, searchStart);
        
        if (foundIndex !== -1 && foundIndex >= currentPos) {
          // Found exact match
          segments.push({
            text: decodedToken,
            tokenIndex: i,
            startIndex: foundIndex,
            endIndex: foundIndex + decodedToken.length,
          });
          currentPos = foundIndex + decodedToken.length;
        } else {
          // If not found, try to match character by character from current position
          // This handles cases where whitespace or special chars might affect matching
          let matched = false;
          for (let offset = 0; offset < 10 && currentPos + offset < text.length; offset++) {
            const testStart = currentPos + offset;
            if (text.substring(testStart, testStart + decodedToken.length) === decodedToken) {
              segments.push({
                text: decodedToken,
                tokenIndex: i,
                startIndex: testStart,
                endIndex: testStart + decodedToken.length,
              });
              currentPos = testStart + decodedToken.length;
              matched = true;
              break;
            }
          }
          
          if (!matched) {
            // Last resort: use approximate position
            segments.push({
              text: decodedToken,
              tokenIndex: i,
              startIndex: currentPos,
              endIndex: Math.min(currentPos + decodedToken.length, text.length),
            });
            currentPos += decodedToken.length;
          }
        }
      }
      
      setTokenSegments(segments);
    } catch (err) {
      console.error('Token counting error:', err);
      toast.error('Failed to count tokens');
      setTokenCount(null);
      setTokenSegments([]);
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || '';
    
    // Determine file type
    let detectedType = 'Unknown';
    if (fileExtension === 'json' || mimeType.includes('json')) {
      detectedType = 'JSON';
    } else if (fileExtension === 'csv' || mimeType.includes('csv')) {
      detectedType = 'CSV';
    } else if (fileExtension === 'yaml' || fileExtension === 'yml' || mimeType.includes('yaml')) {
      detectedType = 'YAML';
    } else if (fileExtension === 'txt' || mimeType.includes('text')) {
      detectedType = 'Text';
    } else if (fileExtension === 'md' || mimeType.includes('markdown')) {
      detectedType = 'Markdown';
    } else if (['js', 'ts', 'tsx', 'jsx'].includes(fileExtension)) {
      detectedType = 'Code';
    } else if (['py', 'java', 'cpp', 'c'].includes(fileExtension)) {
      detectedType = 'Code';
    } else if (['html', 'css'].includes(fileExtension)) {
      detectedType = 'Code';
    } else {
      detectedType = fileExtension.toUpperCase() || 'Unknown';
    }

    setFileType(`${detectedType} (${file.name}, ${(file.size / 1024).toFixed(2)} KB)`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      countTokens(text);
      toast.success('File loaded successfully');
    };
    reader.readAsText(file);
  }, [countTokens]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    if (text.trim()) {
      countTokens(text);
    } else {
      setTokenCount(null);
    }
  }, [countTokens]);

  const handleClear = useCallback(() => {
    setContent('');
    setTokenCount(null);
    setFileType('');
    setTokenSegments([]);
  }, []);

  // Generate color for token based on index
  const getTokenColor = useCallback((tokenIndex: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    ];
    return colors[tokenIndex % colors.length];
  }, []);

  // Render text with token highlighting
  const renderTokenizedText = useMemo(() => {
    if (!content || tokenSegments.length === 0) return null;

    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort segments by startIndex to ensure correct order
    const sortedSegments = [...tokenSegments].sort((a, b) => a.startIndex - b.startIndex);

    sortedSegments.forEach((segment, idx) => {
      // Add text before this token (if any gap)
      if (segment.startIndex > lastIndex) {
        const gapText = content.substring(lastIndex, segment.startIndex);
        if (gapText) {
          elements.push(<span key={`gap-${idx}`}>{gapText}</span>);
        }
      }

      // Add highlighted token
      const tokenText = content.substring(
        segment.startIndex,
        Math.min(segment.endIndex, content.length)
      );
      
      if (tokenText) {
        elements.push(
          <span
            key={`token-${idx}`}
            className={`${getTokenColor(segment.tokenIndex)} px-0.5 py-0.5 rounded border border-current/30 inline-block`}
            title={`Token ${segment.tokenIndex + 1} of ${tokenCount}: "${segment.text.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`}
          >
            {tokenText}
          </span>
        );
      }

      lastIndex = Math.max(lastIndex, segment.endIndex);
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(<span key="text-end">{content.substring(lastIndex)}</span>);
    }

    return elements;
  }, [content, tokenSegments, getTokenColor, tokenCount]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Token Counter</CardTitle>
            <InfoTooltip content="Counts tokens using GPT-4's cl100k_base encoding. Useful for estimating API costs and ensuring prompts fit within model limits. Supports text files, code files, and direct text input." />
          </div>
          <CardDescription>
            Count tokens in text or files. Useful for LLM prompt optimization and cost estimation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-md text-sm">
              Loading tokenizer...
            </div>
          )}
          {tokenizerError && (
            <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-md text-sm">
              <strong>Error:</strong> {tokenizerError}. Please run <code className="bg-muted px-1 rounded">npm install</code> to install gpt-tokenizer.
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Upload File</label>
              <InfoTooltip content="Upload text files, code files, or data files. Supported formats: TXT, JSON, YAML, CSV, Markdown, and common code files (JS, TS, Python, Java, C/C++, HTML, CSS)." />
            </div>
            <FileInput
              accept=".txt,.json,.yaml,.yml,.csv,.md,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css"
              onChange={handleFileUpload}
              disabled={isLoading || !!tokenizerError}
            />
          </div>
          {fileType && (
            <div className="p-3 bg-muted/50 rounded-md border border-border">
              <div className="text-sm font-medium text-foreground mb-1">File Identified:</div>
              <div className="text-sm text-muted-foreground">{fileType}</div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Or paste text directly</label>
              <InfoTooltip content="Paste any text content directly into this field. Token counting happens automatically as you type. The visualization updates in real-time." />
            </div>
            <Textarea
              placeholder="Paste your text here to count tokens..."
              value={content}
              onChange={handleTextChange}
              className="font-mono text-sm min-h-32"
              disabled={isLoading || !!tokenizerError}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" className="flex-1">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {tokenSegments.length > 0 && content && tokenCount !== null && (
        <div className="grid grid-cols-[15%_85%] gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Token Count</CardTitle>
                <InfoTooltip content="Total number of tokens in your text. Also shows character and word counts for reference. Token count is what matters for API pricing and model limits." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{tokenCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">tokens</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Characters</div>
                    <div className="text-base font-semibold">{content.length.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Words</div>
                    <div className="text-base font-semibold">
                      {content.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-xs">
                  <strong>Note:</strong> Uses GPT tokenizer (cl100k_base encoding).
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Token Visualization</CardTitle>
                <InfoTooltip content="Each colored segment represents one token. Colors cycle through 8 hues. Hover over any segment to see its token number and decoded text. This helps you understand how GPT models break down your text." />
              </div>
              <CardDescription>
                Colored segments show how the text is tokenized. Each color represents a different token.
                Hover over segments to see token numbers and decoded text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md border border-border max-h-96 overflow-auto">
                <div className="font-mono text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {renderTokenizedText}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Color Legend:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {Array.from({ length: Math.min(8, tokenSegments.length) }, (_, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50">
                      <span className={`w-4 h-4 rounded border ${getTokenColor(i)}`} />
                      <span className="font-medium">Token {i + 1}</span>
                    </div>
                  ))}
                  {tokenSegments.length > 8 && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                      <span>... and {tokenSegments.length - 8} more tokens</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <strong>Tip:</strong> Colors cycle through 8 different hues. Each highlighted segment represents
                  one token. Hover over segments to see detailed token information.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tokenCount !== null && tokenSegments.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">{tokenCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">tokens</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="text-muted-foreground">Characters</div>
                  <div className="text-lg font-semibold">{content.length.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="text-muted-foreground">Words</div>
                  <div className="text-lg font-semibold">
                    {content.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-sm">
                <strong>Note:</strong> Token count uses GPT tokenizer (cl100k_base encoding). Actual token
                count may vary slightly between different models.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
