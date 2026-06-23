"use client";

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { keyManager } from '@/lib/crypto/key-manager';
import { localStorageHasVaultBlob } from '@/lib/auth-storage';
import {
  reunlockVaultFromSession,
  unlockVaultFromPassphrase,
  rehydratePersistedStores,
} from '@/lib/storage-snapshot';
import { createClient } from '@/utils/supabase/client';
import { useThemeStore } from '@/lib/theme-store';

export function VaultUnlockPrompt() {
  const { locale } = useThemeStore();
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      if (!active) return;

      setUserId(id);
      if (!id) {
        setVisible(false);
        return;
      }

      const restored = await reunlockVaultFromSession(id);
      if (!active) return;

      if (restored) {
        await rehydratePersistedStores();
        setVisible(false);
        return;
      }

      setVisible(localStorageHasVaultBlob() && !keyManager.hasKey());
    };

    void check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void check();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !passphrase) return;

    setLoading(true);
    setError(null);

    try {
      await unlockVaultFromPassphrase(passphrase, userId);
      await rehydratePersistedStores();
      setVisible(false);
      setPassphrase('');
    } catch {
      setError(
        locale === 'pt'
          ? 'Senha incorreta ou dados corrompidos.'
          : locale === 'es'
            ? 'Contraseña incorrecta o datos corruptos.'
            : 'Wrong passphrase or corrupted data.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const title =
    locale === 'pt'
      ? 'Desbloquear vault'
      : locale === 'es'
        ? 'Desbloquear vault'
        : 'Unlock vault';

  const hint =
    locale === 'pt'
      ? 'Use a senha da conta ou a passphrase do vault para acessar dados sensíveis.'
      : locale === 'es'
        ? 'Use la contraseña de la cuenta o la passphrase del vault.'
        : 'Use your account password or vault passphrase to access sensitive data.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-base) 70%, transparent)' }}
    >
      <form
        onSubmit={handleUnlock}
        className="ui-card w-full max-w-md p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="flex items-center gap-3">
          <Lock size={20} style={{ color: 'var(--fg-muted)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--fg-base)' }}>
            {title}
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          {hint}
        </p>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="ui-input w-full"
          autoFocus
          placeholder={locale === 'pt' ? 'Senha ou passphrase' : 'Password or passphrase'}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <button type="submit" disabled={loading || !passphrase} className="ui-button-primary w-full">
          {loading ? '...' : locale === 'pt' ? 'Desbloquear' : locale === 'es' ? 'Desbloquear' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
