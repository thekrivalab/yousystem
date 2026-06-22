"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { createClient } from '@/utils/supabase/client';

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback'];

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());
  const syncSessionUser = useAuthStore((state) => state.syncSessionUser);
  const clearSessionUser = useAuthStore((state) => state.clearSessionUser);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!active) return;

      if (session?.user) {
        const user = session.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        syncSessionUser({
          id: user.id,
          email: user.email ?? '',
          name,
          timezone: user.user_metadata?.timezone,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          provider: user.app_metadata?.provider === 'google' ? 'google' : 'supabase',
        });
        setSessionUserId(user.id);
      } else {
        clearSessionUser();
        setSessionUserId(null);
      }

      setReady(true);
    };

    void bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user) {
        const user = nextSession.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        syncSessionUser({
          id: user.id,
          email: user.email ?? '',
          name,
          timezone: user.user_metadata?.timezone,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          provider: user.app_metadata?.provider === 'google' ? 'google' : 'supabase',
        });
        setSessionUserId(user.id);
      } else {
        clearSessionUser();
        setSessionUserId(null);
      }
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearSessionUser, supabase, syncSessionUser]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!sessionUserId && !isPublic) {
      router.replace('/login');
      return;
    }

    if (sessionUserId && isPublic) {
      router.replace('/home');
    }
  }, [pathname, ready, router, sessionUserId]);

  if (!ready) return null;
  return <>{children}</>;
}
