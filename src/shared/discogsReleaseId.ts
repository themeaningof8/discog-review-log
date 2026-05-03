export function parseDiscogsReleaseId(input: string): number | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }
  const m = /discogs\.com\/release\/(\d+)/i.exec(trimmed);
  if (m) {
    const n = Number(m[1]);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }
  return null;
}
