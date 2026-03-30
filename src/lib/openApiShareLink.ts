import LZString from 'lz-string';

/** Hash fragment format: `#openapi=<lz-string payload>` */
export const OPENAPI_HASH_PREFIX = 'openapi=';

export function compressOpenApiRawForHash(raw: string): string {
  return LZString.compressToEncodedURIComponent(raw);
}

export function decompressOpenApiRawFromHash(encoded: string): string | null {
  const s = LZString.decompressFromEncodedURIComponent(encoded);
  if (s === null || s === '') return null;
  return s;
}

/** Safe upper bound for encoded payload length (browser URL limits vary). */
export const MAX_SHARE_ENCODED_LENGTH = 45_000;
