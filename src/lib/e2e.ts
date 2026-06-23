/** E2E test mode — enabled via NEXT_PUBLIC_E2E_TEST=1 in Playwright webServer env. Never active in production builds. */
export function isE2ETestMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_E2E_TEST === '1';
}

export const E2E_SESSION_COOKIE = 'e2e-session';

export function hasE2ESessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${E2E_SESSION_COOKIE}=1`));
}
