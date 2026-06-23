/** Allow only same-origin relative paths for post-auth redirects. */
export function sanitizeRedirectPath(next: string | null | undefined, fallback = '/home'): string {
  if (!next || typeof next !== 'string') return fallback;

  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') return fallback;
    if (parsed.pathname.startsWith('//')) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
