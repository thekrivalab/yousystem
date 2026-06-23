import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sanitizeRedirectPath } from '@/lib/sanitize-redirect';

const ALLOWED_FORWARDED_HOSTS = new Set(
  (process.env.ALLOWED_FORWARDED_HOSTS ?? '').split(',').map((h) => h.trim()).filter(Boolean)
);

function resolveRedirectOrigin(request: Request, origin: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) return origin;

  if (forwardedHost && ALLOWED_FORWARDED_HOSTS.has(forwardedHost)) {
    return `https://${forwardedHost}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const base = resolveRedirectOrigin(request, origin);
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  const base = resolveRedirectOrigin(request, origin);
  return NextResponse.redirect(`${base}/login?error=auth-callback-failed`);
}
