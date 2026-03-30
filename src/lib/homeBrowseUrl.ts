import type { ToolDefinition } from '@/common/constants';

/** Parse `?q=` and `?category=` from a search string (with or without leading `?`). */
export function parseHomeBrowseSearch(
  search: string,
  tools: readonly ToolDefinition[]
): { q: string; category: string } {
  const qs = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(qs);
  const q = params.get('q') ?? '';
  const cat = params.get('category') ?? 'All';
  const valid = cat === 'All' || tools.some((t) => t.category === cat);
  return { q, category: valid ? cat : 'All' };
}

/** Build `?q=&category=` for the home screen (empty string if defaults). */
export function buildHomeBrowseSearch(q: string, category: string): string {
  const params = new URLSearchParams();
  const qt = q.trim();
  if (qt) params.set('q', qt);
  if (category !== 'All') params.set('category', category);
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** Path to home when current path is under `/tools/:id` (supports GitHub Pages base path). */
export function getHomePathnameFromLocation(pathname: string): string {
  const toolsIdx = pathname.indexOf('/tools/');
  if (toolsIdx === -1) return pathname || '/';
  const prefix = pathname.slice(0, toolsIdx);
  return prefix === '' ? '/' : prefix;
}
