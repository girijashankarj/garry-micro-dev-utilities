import * as yaml from 'js-yaml';

export function parseOpenApiSpec(content: string, fileName = 'openapi.yaml'): unknown {
  const t = content.trim();
  const ext = fileName.toLowerCase();
  if (ext.endsWith('.json')) {
    return JSON.parse(content) as unknown;
  }
  if (ext.endsWith('.yaml') || ext.endsWith('.yml')) {
    return yaml.load(content);
  }
  if (t.startsWith('{') || t.startsWith('[')) {
    return JSON.parse(content) as unknown;
  }
  return yaml.load(content);
}

export function isOpenApiLike(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.openapi === 'string' || typeof o.swagger === 'string';
}
