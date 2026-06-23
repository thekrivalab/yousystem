"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { isE2ETestMode, hasE2ESessionCookie } from '@/lib/e2e';

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback', '/'];

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (isE2ETestMode() && hasE2ESessionCookie()) {
        setAuthenticated(true);
        setReady(true);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      setAuthenticated(!error && !!data.user);
      setReady(true);
    };

    void bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      void supabase.auth.getUser().then(({ data, error }) => {
        if (!active) return;
        setAuthenticated(!error && !!data.user);
        setReady(true);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!authenticated && !isPublic) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (authenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/home');
    }
  }, [pathname, ready, router, authenticated]);

  if (!ready) return null;
  return <>{children}</>;
}
