import type { ToolDefinition } from '@/common/constants';

/**
 * Score how well a tool matches a free-text query.
 * Uses name, id, category, description, and curated keywords (synonyms / related skills).
 */
export function scoreToolMatch(tool: ToolDefinition, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 0;

  let score = 0;

  if (tool.name.toLowerCase().includes(q)) score += 100;
  if (tool.id.toLowerCase().includes(q)) score += 85;
  if (tool.category.toLowerCase().includes(q)) score += 35;

  const words = q.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (tool.name.toLowerCase().includes(w)) score += 28;
    if (tool.id.toLowerCase().includes(w)) score += 22;
    if (tool.category.toLowerCase().includes(w)) score += 18;
    if (tool.description.toLowerCase().includes(w)) score += 12;
    for (const kw of tool.keywords) {
      const k = kw.toLowerCase();
      if (k === w) score += 24;
      else if (k.includes(w) || w.includes(k)) score += 16;
    }
  }

  return score;
}

/** Returns tools sorted by relevance (highest first). Falls back to description/name substring if nothing scores. */
export function rankToolsBySearch(
  tools: readonly ToolDefinition[],
  rawQuery: string
): ToolDefinition[] {
  const q = rawQuery.trim();
  if (!q) return [...tools];

  const scored = tools.map((tool) => ({ tool, score: scoreToolMatch(tool, q) }));
  scored.sort((a, b) => b.score - a.score);

  const positive = scored.filter((x) => x.score > 0).map((x) => x.tool);
  if (positive.length > 0) return positive;

  const ql = q.toLowerCase();
  return tools.filter(
    (t) => t.name.toLowerCase().includes(ql) || t.description.toLowerCase().includes(ql)
  );
}
