import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';
import type { RootState, AppDispatch } from './store';
import { toggleTheme, setTheme } from './store/promptSlice';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { InfoTooltip, Tooltip } from './components/ui/tooltip';
import { TOOLS, APP_NAME } from './common/constants';
import { TokenCounter } from './components/tools/TokenCounter';
import { PiiRemoval } from './components/tools/PiiRemoval';
import { OpenApiViewer } from './components/tools/OpenApiViewer';
import { JwtInspector } from './components/tools/JwtInspector';
import { JsonYamlFormatter } from './components/tools/JsonYamlFormatter';
import { ApiResponseDiff } from './components/tools/ApiResponseDiff';
import { CurlVisualizer } from './components/tools/CurlVisualizer';
import { ApiRiskAnalyzer } from './components/tools/ApiRiskAnalyzer';
import { CsvExplorer } from './components/tools/CsvExplorer';
import { SqlExplainer } from './components/tools/SqlExplainer';

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'token-counter': TokenCounter,
  'pii-removal': PiiRemoval,
  'openapi-viewer': OpenApiViewer,
  'jwt-inspector': JwtInspector,
  'json-yaml-formatter': JsonYamlFormatter,
  'api-response-diff': ApiResponseDiff,
  'curl-visualizer': CurlVisualizer,
  'api-risk-analyzer': ApiRiskAnalyzer,
  'csv-explorer': CsvExplorer,
  'sql-explainer': SqlExplainer,
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.prompt.theme);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Prevent flash of unstyled content
    root.style.colorScheme = theme;
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem('garry-micro-dev-utilities-theme');
      if (!stored) {
        dispatch(setTheme(e.matches ? 'dark' : 'light'));
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [dispatch]);

  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const handleToolClick = useCallback((toolId: string) => {
    setSelectedTool(toolId);
    toast.info(`Opening ${TOOLS.find((t) => t.id === toolId)?.name}`);
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedTool(null);
  }, []);

  const groupedTools = TOOLS.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, typeof TOOLS>
  );

  // Ensure "Developer Tools" category appears first
  const categoryOrder = ['Developer Tools', 'API & Backend', 'Data & Formats', 'Debugging & Security'];
  const sortedCategories = Object.keys(groupedTools).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  if (selectedTool) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-2xl font-bold">{APP_NAME}</h1>
                <p className="text-sm text-muted-foreground">Browser-only developer tools</p>
              </div>
              <InfoTooltip content="A collection of browser-only developer tools for API testing, data formatting, token counting, PII removal, and more. All processing happens locally - no data is sent to servers." />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleBackToHome} variant="outline" size="sm">
                ← Back to Home
              </Button>
              <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                <Button
                  onClick={handleToggleTheme}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="size-4" />
                      <span className="hidden sm:inline">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-4" />
                      <span className="hidden sm:inline">Dark</span>
                    </>
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
          {selectedTool && TOOL_COMPONENTS[selectedTool] ? (
            (() => {
              const ToolComponent = TOOL_COMPONENTS[selectedTool];
              return <ToolComponent />;
            })()
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {TOOLS.find((t) => t.id === selectedTool)?.icon}{' '}
                  {TOOLS.find((t) => t.id === selectedTool)?.name}
                </CardTitle>
                <CardDescription>
                  {TOOLS.find((t) => t.id === selectedTool)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tool implementation coming soon. This tool will be migrated from the original HTML
                  version.
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <Toaster position="bottom-right" theme={theme} richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-border shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white bg-primary">
              🧰
            </div>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xl font-extrabold leading-tight">{APP_NAME}</div>
                <div className="text-xs text-muted-foreground">
                  Browser-only developer tools · Zero backend · Zero login
                </div>
              </div>
              <InfoTooltip content="A collection of browser-only developer tools for API testing, data formatting, token counting, PII removal, and more. All processing happens locally - no data is sent to servers. Works offline after initial load." />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="All tools run entirely in your browser. No data is sent to any server.">
              <div className="text-sm text-muted-foreground hidden md:block cursor-help">🔒 Runs fully in your browser</div>
            </Tooltip>
            <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Button
                onClick={handleToggleTheme}
                variant="outline"
                size="sm"
                className="gap-2"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-8 w-full">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Developer Tools That Just Work</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            A curated collection of small, sharp utilities for everyday engineering problems.
            <strong> No backend. No login. No complexity.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              ⚡ Fast
            </span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              🔒 Private
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
              🔌 Offline-ready
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Available Tools</h2>

          {sortedCategories.map((category) => {
            const tools = groupedTools[category];
            return (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{tool.icon}</div>
                        <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                          Available
                        </span>
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-semibold text-primary">Click to open →</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>{APP_NAME} — Browser-only developer tools</p>
        </div>
      </footer>

      <Toaster position="bottom-right" theme={theme} richColors />
    </div>
  );
}
