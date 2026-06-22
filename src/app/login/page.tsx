"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuthStore } from '@/lib/auth-store';
import { useLifeOSStore } from '@/lib/store';
import { readStorageSnapshot, saveSnapshotToSupabase } from '@/lib/storage-snapshot';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const syncSessionUser = useAuthStore((state) => state.syncSessionUser);
  const updateUser = useLifeOSStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/home');
      }
    };

    void checkSession();
  }, [router, supabase]);

  const handleLogin = async ({ email, password }: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setError('Não foi possível entrar.');
        return;
      }

      syncSessionUser({
        id: user.id,
        email: user.email ?? email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User',
        timezone: user.user_metadata?.timezone,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        provider: user.app_metadata?.provider === 'google' ? 'google' : 'supabase',
      });

      updateUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User',
        timezone: user.user_metadata?.timezone,
        avatarUrl: user.user_metadata?.avatar_url ?? undefined,
      });

      const snapshot = readStorageSnapshot();
      await saveSnapshotToSupabase(supabase, user.id, snapshot);

      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (signInError) {
        setError(signInError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      mode="login"
      loading={loading}
      error={error}
      onSubmit={handleLogin}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
