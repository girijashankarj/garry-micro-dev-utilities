import { TOOLS } from '@/common/constants';
import { getHomePathnameFromLocation } from '@/lib/homeBrowseUrl';

export const TOOL_ROUTE_ALIASES: Record<string, string> = {
  'node-mapper': 'json-diagram-workflow',
};

const TOOL_PARAM = 'tool';

function isValidToolId(canonicalId: string): boolean {
  return TOOLS.some((tool) => tool.id === canonicalId);
}

export function getToolFromPathname(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'tools') {
    const requestedId = decodeURIComponent(parts[1]);
    const canonicalId = TOOL_ROUTE_ALIASES[requestedId] ?? requestedId;
    return isValidToolId(canonicalId) ? canonicalId : null;
  }
  return null;
}

export function isExtensionRuntime(): boolean {
  return import.meta.env.VITE_BUILD_TARGET === 'extension';
}

export function getToolFromSearchParams(search: string): string | null {
  const qs = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(qs);
  const requestedId = params.get(TOOL_PARAM);
  if (!requestedId) return null;
  const canonicalId = TOOL_ROUTE_ALIASES[requestedId] ?? requestedId;
  return isValidToolId(canonicalId) ? canonicalId : null;
}

export function getToolFromWindowLocation(): string | null {
  if (typeof window === 'undefined') return null;
  if (isExtensionRuntime()) {
    return getToolFromSearchParams(window.location.search);
  }
  return getToolFromPathname(window.location.pathname);
}

export function buildToolHistoryUrlWeb(toolId: string): string {
  return `/tools/${encodeURIComponent(toolId)}`;
}

/** Keeps existing search params (e.g. q, category) and sets `tool`. */
export function buildToolHistoryUrlExtension(toolId: string, currentSearch: string): string {
  const qs = currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch;
  const params = new URLSearchParams(qs);
  params.set(TOOL_PARAM, toolId);
  const s = params.toString();
  return `?${s}`;
}

export function buildHomeHistoryUrlExtension(currentSearch: string): string {
  const qs = currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch;
  const params = new URLSearchParams(qs);
  params.delete(TOOL_PARAM);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export function getHomePathForHistory(): string {
  if (typeof window === 'undefined') return '/';
  if (isExtensionRuntime()) {
    return window.location.pathname || '/';
  }
  return getHomePathnameFromLocation(window.location.pathname);
}
