import type { SupabaseClient } from '@supabase/supabase-js';
import { useLifeOSStore } from '@/lib/store';
import { useRoutineStore } from '@/lib/routine-store';
import { useThemeStore } from '@/lib/theme-store';

export const STORAGE_KEYS = [
  'life-os-storage',
  'life-os-theme',
  'life-os-routine',
  'atlas-countries',
] as const;

export type StorageSnapshotKey = (typeof STORAGE_KEYS)[number];
export type StorageSnapshot = Partial<Record<StorageSnapshotKey, string>>;

const TABLE_NAME = 'user_storage_snapshots';

export function readStorageSnapshot(storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
  if (!storage) return {};

  return STORAGE_KEYS.reduce<StorageSnapshot>((snapshot, key) => {
    const value = storage.getItem(key);
    if (value !== null) {
      snapshot[key] = value;
    }
    return snapshot;
  }, {});
}

export function writeStorageSnapshot(snapshot: StorageSnapshot, storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
  if (!storage) return;

  STORAGE_KEYS.forEach((key) => {
    const value = snapshot[key];
    if (typeof value === 'string') {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  });
}

export function clearStorageSnapshot(storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
  if (!storage) return;

  STORAGE_KEYS.forEach((key) => {
    storage.removeItem(key);
  });
}

export function serializeStorageSnapshot(snapshot: StorageSnapshot) {
  return JSON.stringify(
    STORAGE_KEYS.reduce<StorageSnapshot>((acc, key) => {
      const value = snapshot[key];
      if (typeof value === 'string') {
        acc[key] = value;
      }
      return acc;
    }, {})
  );
}

export async function rehydratePersistedStores() {
  await Promise.all([
    useLifeOSStore.persist?.rehydrate?.(),
    useRoutineStore.persist?.rehydrate?.(),
    useThemeStore.persist?.rehydrate?.(),
  ]);
}

export async function loadSnapshotFromSupabase(supabase: SupabaseClient, userId: string) {
  return supabase
    .from(TABLE_NAME)
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function saveSnapshotToSupabase(
  supabase: SupabaseClient,
  userId: string,
  snapshot: StorageSnapshot
) {
  return supabase.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      payload: snapshot,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}
