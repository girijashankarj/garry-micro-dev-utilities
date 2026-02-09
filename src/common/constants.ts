/**
 * Shared constants for Garry Micro Dev Utilities
 */

export const APP_NAME = 'Garry Micro Dev Utilities';

export const STORAGE_KEYS = {
  MODE: 'garry-micro-dev-utilities-mode',
  THEME: 'garry-micro-dev-utilities-theme',
  TOOL_HISTORY: 'garry-micro-dev-utilities-tool-history',
  USER_PREFERENCES: 'garry-micro-dev-utilities-preferences',
} as const;

export const TOOLS = [
  {
    id: 'token-counter',
    name: 'Token Counter',
    description: 'Count tokens in text or files. Useful for LLM prompt optimization and cost estimation',
    category: 'Developer Tools',
    icon: '🔢',
  },
  {
    id: 'pii-removal',
    name: 'PII Removal Tool',
    description: 'Identify and mask Personally Identifiable Information (PII) from files with custom patterns',
    category: 'Developer Tools',
    icon: '🔒',
  },
  {
    id: 'openapi-viewer',
    name: 'OpenAPI Swagger Viewer',
    description: 'Upload OpenAPI YAML/JSON and render interactive API documentation',
    category: 'API & Backend',
    icon: '📋',
  },
  {
    id: 'jwt-inspector',
    name: 'JWT Inspector',
    description: 'Decode and inspect JWT tokens offline. View header, payload, and expiration warnings',
    category: 'API & Backend',
    icon: '🔐',
  },
  {
    id: 'api-response-diff',
    name: 'API Response Diff',
    description: 'Compare two JSON API responses and highlight semantic differences and breaking changes',
    category: 'API & Backend',
    icon: '🔍',
  },
  {
    id: 'curl-visualizer',
    name: 'Curl Command Visualizer',
    description: 'Parse curl commands, visualize headers/params/body, and convert to Fetch/Axios code',
    category: 'API & Backend',
    icon: '🌐',
  },
  {
    id: 'api-risk-analyzer',
    name: 'API Contract Risk Analyzer',
    description: 'Analyze OpenAPI specs for missing error responses, weak validation, and breaking change risks',
    category: 'API & Backend',
    icon: '⚠️',
  },
  {
    id: 'json-yaml-formatter',
    name: 'JSON / YAML Formatter',
    description: 'Format, validate, minify JSON/YAML. Convert between formats. Copy formatted output',
    category: 'Data & Formats',
    icon: '📝',
  },
  {
    id: 'sql-explainer',
    name: 'SQL Query Explainer',
    description: 'Explain SQL queries without execution. Detect joins, filters, and potential performance issues',
    category: 'Debugging & Security',
    icon: '🗄️',
  },
  {
    id: 'csv-explorer',
    name: 'CSV Explorer',
    description: 'Upload CSV files, render as sortable table, search/filter rows, export to JSON',
    category: 'Data & Formats',
    icon: '📊',
  },
] as const;
