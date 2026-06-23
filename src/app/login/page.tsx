"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useLifeOSStore } from '@/lib/store';
import { ensureLocalStorageForUser } from '@/lib/auth-storage';
import { unlockVaultFromPassword } from '@/lib/storage-snapshot';
import { createClient } from '@/utils/supabase/client';
import { sanitizeRedirectPath } from '@/lib/sanitize-redirect';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateUser = useLifeOSStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const checkSession = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!userError && data.user) {
        const next = sanitizeRedirectPath(searchParams.get('next'));
        router.replace(next);
      }
    };

    void checkSession();
  }, [router, searchParams, supabase]);

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

      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (userError || !user) {
        setError('Não foi possível entrar.');
        return;
      }

      await ensureLocalStorageForUser(user.id);
      await unlockVaultFromPassword(password, user.id);

      updateUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User',
        timezone: user.user_metadata?.timezone,
        avatarUrl: user.user_metadata?.avatar_url ?? undefined,
      });

      const next = sanitizeRedirectPath(searchParams.get('next'));
      router.replace(next);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const next = sanitizeRedirectPath(searchParams.get('next'));
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
