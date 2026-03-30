/**
 * Shared constants for Garry Micro Dev Utilities
 */

/** Product identity — single source for UI copy, meta, and package description */
export const BRAND = {
  /** Full product name (tab title, headers, package) */
  name: 'Garry Micro Dev Utilities',
  /** Short name for compact UI */
  nameShort: 'Garry',
  /** Browser tab suffix on the home screen */
  homeTitleSuffix: 'Local-first utilities',
  /** One line under the logo */
  tagline:
    'Local-first utilities for code, application programming interfaces (APIs), data formats, and delivery.',
  /** Compact header line (uses middle dots) */
  headerBits: 'Local-first · Private · No account',
  /** Hero */
  heroHeadline: 'Utilities that stay in your browser',
  heroSubheadline:
    'JavaScript Object Notation (JSON), APIs, modeling, planning, and architecture — one fast, offline-ready suite. No backend. No sign-up.',
  /** SEO / meta description (~155 chars) */
  metaDescription:
    'Garry Micro Dev Utilities: fast, private, browser-only tools for JSON, APIs, JSON Web Tokens (JWT), OpenAPI specs, data formats, planning, and architecture. No server. No login.',
  /** Long “about” for tooltips */
  aboutLong:
    'A curated set of utilities for everyday engineering work — application programming interfaces (APIs), data, tokens, privacy, planning, and architecture. Everything runs locally in your browser; nothing is uploaded. Works offline after the first load as a Progressive Web App (PWA).',
  /** One-sentence privacy promise */
  privacyLine: 'Everything runs in your browser. Your data never leaves this device.',
  privacyLineShort: 'Runs locally in your browser',
  /** Footer */
  footerLine: 'Local-first browser utilities · No telemetry · No sign-up',
  /** PWA install hint (shown under footer on home) */
  pwaHint:
    'Install as a Progressive Web App (PWA) from your browser (address bar or menu) for offline use after the first load — data stays on device.',
  /** Footer subline when running as the Chrome extension build */
  extensionHint:
    'Chrome extension: utilities run locally in the popup. For phones, use the hosted web app and Add to Home Screen (Progressive Web App / PWA).',
  /** Value chips (home hero) */
  chipFast: 'Instant',
  chipPrivate: 'Private',
  chipOffline: 'Offline-ready (Progressive Web App / PWA)',
  /** Cards & navigation */
  cardCta: 'Open tool →',
  cardBadgeInSuite: 'In suite',
  backToLibrary: '← Back to library',
  sectionBrowse: 'Browse tools',
  sectionRecent: 'Recently opened',
  sectionSearchResults: 'Search results',
  transparencyHeading: 'Transparency',
  /** Subtitle next to the transparency heading on tool pages */
  transparencyBannerSubtitle:
    'Node Package Manager (npm) packages that affect this tool’s behavior',
  /** Badge when a tool uses no domain npm packages */
  transparencyNoPackages: 'No extra npm (Node Package Manager) packages — browser APIs only',
} as const;

export const APP_NAME = BRAND.name;

export const STORAGE_KEYS = {
  MODE: 'garry-micro-dev-utilities-mode',
  THEME: 'garry-micro-dev-utilities-theme',
  TOOL_HISTORY: 'garry-micro-dev-utilities-tool-history',
  USER_PREFERENCES: 'garry-micro-dev-utilities-preferences',
  /** Session-only: last home `?q=&category=` when opening a tool (restore on Back to library) */
  HOME_BROWSE_STATE: 'garry-micro-dev-utilities-home-browse',
} as const;

/** One npm package entry for transparency (cards + tool pages). */
export type ToolPackageInfo = {
  /** Published package name, e.g. @xyflow/react */
  name: string;
  /** What this package does in this tool */
  description: string;
};

export type ToolTransparency = {
  /** Plain-language summary for developers */
  summary: string;
  /** Domain / logic npm packages (not the whole app shell) */
  packages: readonly ToolPackageInfo[];
};

export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  /** UX grouping — intent-based, not job-title silos */
  category: string;
  icon: string;
  /** Synonyms and related terms to improve search relevance */
  keywords: readonly string[];
  transparency: ToolTransparency;
};

export const TOOLS: readonly ToolDefinition[] = [
  {
    id: 'json-diff-tool',
    name: 'JavaScript Object Notation (JSON) diff (fixed left / right)',
    description:
      'Compare left and right JSON (JavaScript Object Notation), format either side, and convert JavaScript object literals to JSON',
    category: 'Developer Essentials',
    icon: '🧩',
    keywords: ['json', 'diff', 'compare', 'merge', 'format', 'object', 'payload', 'api'],
    transparency: {
      summary:
        'Parsing uses JSON.parse where possible; loose JavaScript object literals use a scoped Function. Diffing is custom TypeScript in this repo — no dedicated diff library.',
      packages: [],
    },
  },
  {
    id: 'encoding-utils',
    name: 'Base64 + JSON Web Token (JWT) decode',
    description:
      'Decode Base64 text and inspect JSON Web Token (JWT) header, payload, and signature directly in the browser',
    category: 'Developer Essentials',
    icon: '🔓',
    keywords: ['base64', 'decode', 'encode', 'jwt', 'token', 'atob', 'bearer', 'claims'],
    transparency: {
      summary:
        'Base64 uses atob/TextDecoder; JSON Web Token (JWT) segments are base64url-decoded and parsed as JSON in this component — no jwt-decode package here.',
      packages: [],
    },
  },
  {
    id: 'json-diagram-workflow',
    name: 'JSON Diagram & Workflow',
    description:
      'Visualize JSON as an interactive diagram and Mermaid flowchart — for data models, configs, org views, or workflows (any role)',
    category: 'Diagrams & Modeling',
    icon: '🔀',
    keywords: [
      'diagram',
      'mermaid',
      'flowchart',
      'graph',
      'workflow',
      'model',
      'tree',
      'structure',
      'xyflow',
      'react flow',
    ],
    transparency: {
      summary:
        'JSON structure walking is implemented in this repo. The interactive canvas and Mermaid view use the packages below.',
      packages: [
        {
          name: '@xyflow/react',
          description: 'Interactive node graph (React Flow UI and behavior).',
        },
        {
          name: '@xyflow/system',
          description: 'Graph helpers (bounds, connections) used with XYFlow.',
        },
        { name: 'mermaid', description: 'Flowchart rendering for the Mermaid tab.' },
      ],
    },
  },
  {
    id: 'url-toolkit',
    name: 'Uniform Resource Locator (URL) toolkit',
    description:
      'Parse URLs, edit query parameters, rebuild links, encode or decode uniform resource identifier (URI) components',
    category: 'Developer Essentials',
    icon: '🔗',
    keywords: ['url', 'uri', 'query', 'params', 'encode', 'decode', 'link', 'routing'],
    transparency: {
      summary:
        'Uses the browser URL application programming interface (API), URLSearchParams, encodeURIComponent, and decodeURIComponent only — no URL parsing libraries.',
      packages: [],
    },
  },
  {
    id: 'unix-time-converter',
    name: 'Unix time converter',
    description:
      'Convert Unix epoch seconds or milliseconds to ISO 8601 and local time, relative labels, and copy helpers',
    category: 'Developer Essentials',
    icon: '⏱️',
    keywords: ['time', 'epoch', 'timestamp', 'unix', 'utc', 'iso', 'date', 'timezone'],
    transparency: {
      summary:
        'Date math uses the built-in Date object and Intl.RelativeTimeFormat. No date libraries.',
      packages: [],
    },
  },
  {
    id: 'regex-playground',
    name: 'Regular expression (RegExp) playground',
    description:
      'Test JavaScript regular expression (RegExp) patterns with flags, highlighted matches, and capture groups',
    category: 'Developer Essentials',
    icon: '✴️',
    keywords: ['regex', 'regexp', 'pattern', 'match', 'capture', 'grok'],
    transparency: {
      summary:
        'Matching uses the native RegExp constructor and exec/matchAll. Highlighting is plain spans in React.',
      packages: [],
    },
  },
  {
    id: 'token-counter',
    name: 'Token counter',
    description:
      'Count tokens in text or files — useful for large language model (LLM) prompt sizing and cost estimation',
    category: 'Developer Essentials',
    icon: '🔢',
    keywords: ['token', 'gpt', 'openai', 'llm', 'prompt', 'claude', 'cost', 'embedding'],
    transparency: {
      summary: 'Token counts come from the OpenAI-compatible tokenizer encoding loaded below.',
      packages: [
        { name: 'gpt-tokenizer', description: 'cl100k_base encode/decode for token counts.' },
      ],
    },
  },
  {
    id: 'pii-removal',
    name: 'Personally identifiable information (PII) removal',
    description:
      'Identify and mask personally identifiable information (PII) from files with custom patterns',
    category: 'Developer Essentials',
    icon: '🔒',
    keywords: ['pii', 'privacy', 'redact', 'mask', 'gdpr', 'sanitize', 'sensitive'],
    transparency: {
      summary:
        'Matching and masking use string/regex logic in this repo. No dedicated NLP or ML libraries.',
      packages: [],
    },
  },
  {
    id: 'openapi-viewer',
    name: 'Swagger / OpenAPI (API specification) preview',
    description:
      'Upload or paste a Swagger or OpenAPI specification in YAML (YAML Ain’t Markup Language) or JSON (JavaScript Object Notation) and preview interactive documentation or raw text',
    category: 'APIs & Integration',
    icon: '📋',
    keywords: [
      'openapi',
      'swagger',
      'rest',
      'spec',
      'yaml',
      'documentation',
      'api',
      'upload',
      'preview',
      'contract',
      'share',
      'link',
    ],
    transparency: {
      summary:
        'Specs are parsed in the browser (YAML via js-yaml). Interactive documentation is Swagger UI for React.',
      packages: [
        {
          name: 'swagger-ui-react',
          description: 'Renders interactive OpenAPI / Swagger (API) documentation.',
        },
        {
          name: 'js-yaml',
          description:
            'Parses YAML (YAML Ain’t Markup Language) OpenAPI specs to JavaScript objects.',
        },
      ],
    },
  },
  {
    id: 'jwt-inspector',
    name: 'JSON Web Token (JWT) inspector',
    description:
      'Decode and inspect JSON Web Token (JWT) strings offline — view header, payload, and expiration warnings',
    category: 'APIs & Integration',
    icon: '🔐',
    keywords: ['jwt', 'token', 'oauth', 'bearer', 'claims', 'exp', 'signature'],
    transparency: {
      summary:
        'JSON Web Token (JWT) payload and header decoding use this package’s decode implementation.',
      packages: [
        {
          name: 'jwt-decode',
          description: 'Decodes JSON Web Token (JWT) payload and header for display.',
        },
      ],
    },
  },
  {
    id: 'api-response-diff',
    name: 'Application programming interface (API) response diff',
    description:
      'Compare two JavaScript Object Notation (JSON) API responses and highlight semantic differences and breaking changes',
    category: 'APIs & Integration',
    icon: '🔍',
    keywords: ['api', 'diff', 'response', 'json', 'contract', 'breaking', 'regression'],
    transparency: {
      summary:
        'Comparison walks parsed JSON objects in TypeScript. No external diff or patch libraries.',
      packages: [],
    },
  },
  {
    id: 'curl-visualizer',
    name: 'cURL (command-line URL) command visualizer',
    description:
      'Parse cURL commands, visualize headers, parameters, and body, and convert to Fetch API or Axios code',
    category: 'APIs & Integration',
    icon: '🌐',
    keywords: ['curl', 'http', 'fetch', 'axios', 'request', 'cli'],
    transparency: {
      summary:
        'Parsing uses regular expressions and string handling in this repo — not a dedicated curl parser library.',
      packages: [],
    },
  },
  {
    id: 'api-risk-analyzer',
    name: 'API contract risk analyzer (OpenAPI)',
    description:
      'Analyze OpenAPI specifications for missing error responses, weak validation, and breaking-change risks',
    category: 'APIs & Integration',
    icon: '⚠️',
    keywords: ['risk', 'openapi', 'contract', 'validation', 'errors', 'governance'],
    transparency: {
      summary:
        'Uploaded OpenAPI YAML/JSON is parsed with js-yaml; analysis rules are implemented here.',
      packages: [{ name: 'js-yaml', description: 'Parses YAML specs into objects for analysis.' }],
    },
  },
  {
    id: 'json-yaml-formatter',
    name: 'JavaScript Object Notation (JSON) / YAML formatter',
    description:
      'Format, validate, and minify JSON and YAML (YAML Ain’t Markup Language). Convert between formats and copy formatted output',
    category: 'Data & Files',
    icon: '📝',
    keywords: ['json', 'yaml', 'format', 'minify', 'validate', 'config', 'serialize'],
    transparency: {
      summary:
        'YAML parsing and stringification use js-yaml; JSON uses native JSON.parse/stringify.',
      packages: [
        {
          name: 'js-yaml',
          description: 'YAML (YAML Ain’t Markup Language) ↔ object conversion and validation.',
        },
      ],
    },
  },
  {
    id: 'sql-explainer',
    name: 'Structured Query Language (SQL) query explainer',
    description:
      'Explain structured query language (SQL) queries without execution — detect joins, filters, and potential performance issues',
    category: 'Data & Files',
    icon: '🗄️',
    keywords: ['sql', 'query', 'database', 'join', 'explain', 'performance', 'postgres'],
    transparency: {
      summary:
        'Structured query language (SQL) text is analyzed with heuristics and regex-style parsing in this repo — no SQL parser library.',
      packages: [],
    },
  },
  {
    id: 'csv-explorer',
    name: 'Comma-separated values (CSV) explorer',
    description:
      'Upload comma-separated values (CSV) files, render as a sortable table, search or filter rows, export to JavaScript Object Notation (JSON)',
    category: 'Data & Files',
    icon: '📊',
    keywords: ['csv', 'table', 'spreadsheet', 'tabular', 'export', 'rows', 'columns'],
    transparency: {
      summary:
        'Comma-separated values (CSV) parsing and table logic are implemented in this repo (splitting rows, filtering).',
      packages: [],
    },
  },
  {
    id: 'raci-matrix',
    name: 'Responsible, Accountable, Consulted, Informed (RACI) matrix',
    description:
      'Define tasks and responsible / accountable / consulted / informed (R/A/C/I) assignments per role; export comma-separated values (CSV) for stakeholders',
    category: 'Planning & Delivery',
    icon: '📐',
    keywords: ['raci', 'responsible', 'accountable', 'stakeholder', 'roles', 'governance', 'ba'],
    transparency: {
      summary:
        'Matrix state and comma-separated values (CSV) export are implemented in TypeScript with no spreadsheet or table libraries.',
      packages: [],
    },
  },
  {
    id: 'risk-register',
    name: 'Risk Register',
    description:
      'Track probability, impact, severity, mitigation, owner, and status; export comma-separated values (CSV)',
    category: 'Planning & Delivery',
    icon: '⚡',
    keywords: ['risk', 'register', 'mitigation', 'impact', 'probability', 'raid', 'pm'],
    transparency: {
      summary:
        'Severity scoring and comma-separated values (CSV) export use plain arithmetic and string formatting in the browser.',
      packages: [],
    },
  },
  {
    id: 'meeting-action-tracker',
    name: 'Meeting Notes & Actions',
    description:
      'Capture notes, manage action items with owners and dates, export Markdown (lightweight markup) text',
    category: 'Planning & Delivery',
    icon: '📝',
    keywords: ['meeting', 'notes', 'actions', 'follow up', 'retro', 'standup', 'owner', 'due'],
    transparency: {
      summary:
        'Notes and actions are local state; Markdown is built with template strings — no markdown parser.',
      packages: [],
    },
  },
  {
    id: 'timeline-milestone-planner',
    name: 'Timeline & Milestones',
    description:
      'Set project start and milestone offsets; see target dates and export comma-separated values (CSV)',
    category: 'Planning & Delivery',
    icon: '📅',
    keywords: ['timeline', 'milestone', 'schedule', 'plan', 'roadmap', 'delivery', 'release'],
    transparency: {
      summary:
        'Date math uses the built-in Date object; comma-separated values (CSV) export is string concatenation only.',
      packages: [],
    },
  },
  {
    id: 'adr-builder',
    name: 'Architecture Decision Record (ADR) builder',
    description:
      'Fill architecture decision record (ADR) sections and copy Markdown (lightweight markup) for your documentation repository',
    category: 'Architecture & Governance',
    icon: '🏛️',
    keywords: ['adr', 'decision', 'architecture', 'record', 'markdown', 'design', 'rfc'],
    transparency: {
      summary:
        'Architecture decision record (ADR) text is assembled from form fields in this component — no Markdown abstract syntax tree (AST) or template engine.',
      packages: [],
    },
  },
  {
    id: 'nfr-checklist',
    name: 'Non-functional requirements (NFR) checklist',
    description:
      'Security, performance, availability, observability, and data quality — capture status and notes for non-functional requirements (NFRs)',
    category: 'Architecture & Governance',
    icon: '✅',
    keywords: [
      'nfr',
      'non-functional',
      'quality',
      'security',
      'performance',
      'sla',
      'observability',
      'compliance',
    ],
    transparency: {
      summary:
        'Non-functional requirements (NFR) checklist items and summary counts are plain React state; export is plain text.',
      packages: [],
    },
  },
];
