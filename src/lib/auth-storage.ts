import { clearStorageSnapshot, lockVault, rehydratePersistedStores } from '@/lib/storage-snapshot';

export function getLocalStorageUserId(): string | null {
  if (typeof localStorage === 'undefined') return null;

  const raw = localStorage.getItem('life-os-storage');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } };
    const id = parsed.state?.user?.id;
    return typeof id === 'string' && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export function localStorageHasVaultBlob(): boolean {
  if (typeof localStorage === 'undefined') return false;

  const raw = localStorage.getItem('life-os-storage');
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as { state?: { _vault?: unknown }; _vault?: unknown };
    return !!(parsed.state?._vault ?? parsed._vault);
  } catch {
    return false;
  }
}

/** Clears local app data when a different Supabase user signs in on the same browser. */
export async function ensureLocalStorageForUser(userId: string): Promise<boolean> {
  const localUserId = getLocalStorageUserId();
  if (localUserId && localUserId !== userId) {
    clearStorageSnapshot();
    lockVault();
    await rehydratePersistedStores();
    return true;
  }
  return false;
}
