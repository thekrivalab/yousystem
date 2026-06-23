"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm, getDeviceTimezone } from '@/components/AuthForm';
import { useLifeOSStore } from '@/lib/store';
import { ensureLocalStorageForUser } from '@/lib/auth-storage';
import { unlockVaultFromPassword } from '@/lib/storage-snapshot';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const updateUser = useLifeOSStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const checkSession = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!userError && data.user) {
        router.replace('/home');
      }
    };

    void checkSession();
  }, [router, supabase]);

  const handleRegister = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name,
            timezone: getDeviceTimezone(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user ?? data.user;
      if (userError || !user) {
        setError('Verifique seu e-mail para concluir o cadastro, ou desative confirmação de e-mail no Supabase para login imediato.');
        return;
      }

      await ensureLocalStorageForUser(user.id);
      await unlockVaultFromPassword(password, user.id);

      updateUser({
        id: user.id,
        name,
        timezone: getDeviceTimezone(),
        avatarUrl: user.user_metadata?.avatar_url ?? undefined,
      });

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
      mode="register"
      loading={loading}
      error={error}
      onSubmit={handleRegister}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
