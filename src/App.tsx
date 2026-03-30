import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { Link2, Moon, Sun } from 'lucide-react';
import type { RootState, AppDispatch } from './store';
import type { ToolDefinition } from './common/constants';
import { toggleTheme, setTheme } from './store/promptSlice';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { InfoTooltip, Tooltip } from './components/ui/tooltip';
import { TOOLS, BRAND, STORAGE_KEYS } from './common/constants';
import { buildHomeBrowseSearch, parseHomeBrowseSearch } from './lib/homeBrowseUrl';
import {
  buildHomeHistoryUrlExtension,
  buildToolHistoryUrlExtension,
  buildToolHistoryUrlWeb,
  getHomePathForHistory,
  getToolFromWindowLocation,
  isExtensionRuntime,
  TOOL_ROUTE_ALIASES,
} from './lib/appToolRoutes';
import { rankToolsBySearch } from './lib/toolSearch';
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
import { JsonDiffTool } from './components/tools/JsonDiffTool';
import { EncodingUtils } from './components/tools/EncodingUtils';
import { JsonDiagramWorkflow } from './components/tools/JsonDiagramWorkflow';
import { UrlToolkit } from './components/tools/UrlToolkit';
import { UnixTimeConverter } from './components/tools/UnixTimeConverter';
import { RegexPlayground } from './components/tools/RegexPlayground';
import { RaciMatrix } from './components/tools/RaciMatrix';
import { RiskRegister } from './components/tools/RiskRegister';
import { MeetingActionTracker } from './components/tools/MeetingActionTracker';
import { TimelineMilestonePlanner } from './components/tools/TimelineMilestonePlanner';
import { AdrBuilder } from './components/tools/AdrBuilder';
import { NfrChecklist } from './components/tools/NfrChecklist';
import { ToolPackageTags, ToolTransparencyBanner } from './components/ToolTransparency';
import { useLocalStorage } from './hooks/use-local-storage';

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'json-diff-tool': JsonDiffTool,
  'encoding-utils': EncodingUtils,
  'json-diagram-workflow': JsonDiagramWorkflow,
  'url-toolkit': UrlToolkit,
  'unix-time-converter': UnixTimeConverter,
  'regex-playground': RegexPlayground,
  'raci-matrix': RaciMatrix,
  'risk-register': RiskRegister,
  'meeting-action-tracker': MeetingActionTracker,
  'timeline-milestone-planner': TimelineMilestonePlanner,
  'adr-builder': AdrBuilder,
  'nfr-checklist': NfrChecklist,
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
  const [searchQuery, setSearchQuery] = useState(() =>
    typeof window === 'undefined' ? '' : parseHomeBrowseSearch(window.location.search, TOOLS).q
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(() =>
    typeof window === 'undefined'
      ? 'All'
      : parseHomeBrowseSearch(window.location.search, TOOLS).category
  );
  const [selectedTool, setSelectedTool] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getToolFromWindowLocation()
  );
  const [recentTools, setRecentTools] = useLocalStorage<string[]>(STORAGE_KEYS.TOOL_HISTORY, []);

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

  const handleToolClick = useCallback(
    (toolId: string) => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEYS.HOME_BROWSE_STATE, window.location.search);
        } catch {
          /* ignore */
        }
        if (isExtensionRuntime()) {
          window.history.pushState(
            { toolId },
            '',
            `${window.location.pathname}${buildToolHistoryUrlExtension(toolId, window.location.search)}`
          );
        } else {
          window.history.pushState({ toolId }, '', buildToolHistoryUrlWeb(toolId));
        }
      }
      setSelectedTool(toolId);
      setRecentTools((prev) => [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 6));
      toast.info(`Opening ${TOOLS.find((t) => t.id === toolId)?.name}`);
    },
    [setRecentTools]
  );

  const handleBackToHome = useCallback(() => {
    if (typeof window !== 'undefined') {
      let qs = '';
      try {
        qs = sessionStorage.getItem(STORAGE_KEYS.HOME_BROWSE_STATE) ?? '';
      } catch {
        qs = '';
      }
      const homePath = getHomePathForHistory();
      const normalizedQs = qs.startsWith('?') ? qs : qs ? `?${qs}` : '';
      const nextSearch = isExtensionRuntime()
        ? buildHomeHistoryUrlExtension(normalizedQs)
        : normalizedQs;
      window.history.pushState({}, '', `${homePath}${nextSearch}`);
      const parsed = parseHomeBrowseSearch(nextSearch, TOOLS);
      setSearchQuery(parsed.q);
      setSelectedCategoryFilter(parsed.category);
    }
    setSelectedTool(null);
  }, []);

  const handleCopyHomeLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}${buildHomeBrowseSearch(searchQuery, selectedCategoryFilter)}`;
    void navigator.clipboard.writeText(url);
    toast.success('Link copied');
  }, [searchQuery, selectedCategoryFilter]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const tool = getToolFromWindowLocation();
      setSelectedTool(tool);
      if (!tool) {
        const { q, category } = parseHomeBrowseSearch(window.location.search, TOOLS);
        setSearchQuery(q);
        setSelectedCategoryFilter(category);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /** Keep `?q=` / `?category=` in sync on the home screen for shareable URLs */
  useEffect(() => {
    if (typeof window === 'undefined' || selectedTool) return;
    if (getToolFromWindowLocation()) return;
    const search = buildHomeBrowseSearch(searchQuery, selectedCategoryFilter);
    window.history.replaceState({}, '', `${window.location.pathname}${search}`);
  }, [searchQuery, selectedCategoryFilter, selectedTool]);

  // Canonicalize legacy /tools/node-mapper to /tools/json-diagram-workflow in the address bar (web only)
  useEffect(() => {
    if (typeof window === 'undefined' || isExtensionRuntime()) return;
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length !== 2 || parts[0] !== 'tools') return;
    const id = decodeURIComponent(parts[1]);
    const canonical = TOOL_ROUTE_ALIASES[id];
    if (canonical) {
      window.history.replaceState({}, '', buildToolHistoryUrlWeb(canonical));
    }
  }, []);

  const searchTrimmed = searchQuery.trim();
  const categoryFiltered = TOOLS.filter(
    (tool) => selectedCategoryFilter === 'All' || tool.category === selectedCategoryFilter
  );

  const filteredTools = !searchTrimmed
    ? categoryFiltered
    : rankToolsBySearch(categoryFiltered, searchTrimmed);

  const groupedTools = filteredTools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, Array<(typeof TOOLS)[number]>>
  );

  const categoryOrder = [
    'Developer Essentials',
    'APIs & Integration',
    'Data & Files',
    'Diagrams & Modeling',
    'Planning & Delivery',
    'Architecture & Governance',
  ];
  const sortedCategories = Object.keys(groupedTools).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const activeTool: ToolDefinition | undefined = selectedTool
    ? TOOLS.find((t) => t.id === selectedTool)
    : undefined;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (selectedTool && activeTool) {
      document.title = `${activeTool.name} · ${BRAND.name}`;
    } else {
      document.title = `${BRAND.name} · ${BRAND.homeTitleSuffix}`;
    }
  }, [selectedTool, activeTool]);

  const recentToolObjects = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((tool): tool is ToolDefinition => Boolean(tool));

  if (selectedTool) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-primary">{BRAND.nameShort}</span>
                  <span className="text-muted-foreground font-semibold"> Micro Dev Utilities</span>
                </h1>
                <p className="text-sm text-muted-foreground">{BRAND.tagline}</p>
              </div>
              <InfoTooltip content={BRAND.aboutLong} />
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button onClick={handleBackToHome} variant="outline" size="sm" className="min-h-10">
                {BRAND.backToLibrary}
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

        <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-4 py-6">
          {activeTool && <ToolTransparencyBanner tool={activeTool} />}
          {selectedTool && TOOL_COMPONENTS[selectedTool] ? (
            (() => {
              const ToolComponent = TOOL_COMPONENTS[selectedTool];
              return <ToolComponent />;
            })()
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTool?.icon} {activeTool?.name}
                </CardTitle>
                <CardDescription>{activeTool?.description}</CardDescription>
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
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white bg-primary text-xl shadow-sm"
              aria-hidden
            >
              🧰
            </div>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xl font-extrabold leading-tight tracking-tight">
                  <span className="text-foreground">{BRAND.nameShort}</span>
                  <span className="text-muted-foreground font-semibold"> Micro Dev Utilities</span>
                </div>
                <div className="text-xs text-muted-foreground">{BRAND.headerBits}</div>
              </div>
              <InfoTooltip content={BRAND.aboutLong} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip content={BRAND.privacyLine}>
              <div className="text-sm text-muted-foreground hidden md:block cursor-help max-w-[min(100%,12rem)] truncate">
                🔒 {BRAND.privacyLineShort}
              </div>
            </Tooltip>
            <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Button
                onClick={handleToggleTheme}
                variant="outline"
                size="sm"
                className="gap-2 min-h-10 min-w-10 sm:min-w-0"
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

      <main className="flex-1 max-w-[1400px] mx-auto px-3 sm:px-4 py-6 sm:py-8 w-full">
        <section className="text-center mb-8 sm:mb-12" aria-labelledby="hero-heading">
          <p className="text-sm font-medium text-primary mb-2">{BRAND.name}</p>
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {BRAND.heroHeadline}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            {BRAND.heroSubheadline}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              ⚡ {BRAND.chipFast}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              🔒 {BRAND.chipPrivate}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
              🔌 {BRAND.chipOffline}
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">{BRAND.sectionBrowse}</h2>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 max-w-2xl">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, topic, or keyword (e.g. JSON Web Token (JWT), YAML, risk register, timeline)…"
                className="w-full min-h-10 text-base sm:text-sm"
                aria-label="Search tools"
              />
              <Tooltip content="Copy a link that includes your current search and category filter">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 shrink-0 gap-1.5 w-full sm:w-auto"
                  onClick={handleCopyHomeLink}
                >
                  <Link2 className="size-4 shrink-0" aria-hidden />
                  Copy link
                </Button>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategoryFilter === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategoryFilter('All')}
                className="min-h-10"
              >
                All ({TOOLS.length})
              </Button>
              {categoryOrder
                .filter((category) => TOOLS.some((tool) => tool.category === category))
                .map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategoryFilter === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategoryFilter(category)}
                    className="min-h-10 text-left sm:text-center"
                  >
                    {category} ({TOOLS.filter((tool) => tool.category === category).length})
                  </Button>
                ))}
            </div>
          </div>

          {searchQuery.trim() === '' &&
            selectedCategoryFilter === 'All' &&
            recentToolObjects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">
                  {BRAND.sectionRecent}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentToolObjects.map((tool) => (
                    <Card
                      key={`recent-${tool.id}`}
                      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-primary/30"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{tool.icon}</div>
                          <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            Recent
                          </span>
                        </div>
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                        <div className="mt-3 space-y-1 text-left">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {BRAND.transparencyHeading}
                          </div>
                          <ToolPackageTags tool={tool} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-semibold text-primary">{BRAND.cardCta}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {searchTrimmed ? (
            filteredTools.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                No tools matched that search. Try different keywords or clear the category filter.
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                  {BRAND.sectionSearchResults}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} · ranked by
                  relevance
                  {selectedCategoryFilter !== 'All' ? ` · filtered: ${selectedCategoryFilter}` : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="text-3xl">{tool.icon}</div>
                          <span className="text-xs px-2 py-1 rounded shrink-0 bg-muted text-muted-foreground border border-border">
                            {tool.category}
                          </span>
                        </div>
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                        <div className="mt-3 space-y-1 text-left">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {BRAND.transparencyHeading}
                          </div>
                          <ToolPackageTags tool={tool} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-semibold text-primary">{BRAND.cardCta}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              {sortedCategories.length === 0 && (
                <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                  No tools found. Try a different category.
                </div>
              )}

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
                                {BRAND.cardBadgeInSuite}
                              </span>
                            </div>
                            <CardTitle>{tool.name}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                            <div className="mt-3 space-y-1 text-left">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {BRAND.transparencyHeading}
                              </div>
                              <ToolPackageTags tool={tool} />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm font-semibold text-primary">
                              {BRAND.cardCta}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4 text-center text-sm text-muted-foreground">
          <p>{BRAND.footerLine}</p>
          <p className="mt-2 max-w-2xl mx-auto text-xs text-muted-foreground/90">
            {isExtensionRuntime() ? BRAND.extensionHint : BRAND.pwaHint}
          </p>
        </div>
      </footer>

      <Toaster position="bottom-right" theme={theme} richColors />
    </div>
  );
}
