import type { SupabaseClient } from '@supabase/supabase-js';
import { useLifeOSStore } from '@/lib/store';
import { useRoutineStore } from '@/lib/routine-store';
import { useThemeStore } from '@/lib/theme-store';
import { keyManager, sealSensitiveFields, unsealSensitiveFields } from '@/lib/crypto/key-manager';
import {
  SYNC_META_KEY,
  buildSyncMeta,
  mergeSnapshots,
  parseSyncMeta,
  saveRecoverySnapshot,
  type SyncMeta,
} from '@/lib/sync-engine';

/** Canonical key for country code → name mapping (synced to Supabase). */
export const ATLAS_MAPPING_KEY = 'atlas-countries-mapping' as const;

/** Legacy key — migrated automatically into atlas-countries-mapping. */
const LEGACY_ATLAS_KEY = 'atlas-countries' as const;

export const STORAGE_KEYS = [
  'life-os-storage',
  'life-os-theme',
  'life-os-routine',
  ATLAS_MAPPING_KEY,
  SYNC_META_KEY,
] as const;

export type StorageSnapshotKey = (typeof STORAGE_KEYS)[number];
export type StorageSnapshot = Partial<Record<StorageSnapshotKey, string>>;

const TABLE_NAME = 'user_storage_snapshots';

function migrateLegacyAtlasCountries(storage: Storage): void {
  const legacyRaw = storage.getItem(LEGACY_ATLAS_KEY);
  if (!legacyRaw) return;

  try {
    const legacy = JSON.parse(legacyRaw) as Record<string, { status?: string; name?: string }>;
    const existingRaw = storage.getItem(ATLAS_MAPPING_KEY);
    const mapping: Record<string, string> = existingRaw ? JSON.parse(existingRaw) : {};

    for (const [code, entry] of Object.entries(legacy)) {
      if (!mapping[code] && entry?.name) {
        mapping[code] = entry.name;
      }
    }

    storage.setItem(ATLAS_MAPPING_KEY, JSON.stringify(mapping));
    storage.removeItem(LEGACY_ATLAS_KEY);
  } catch {
    storage.removeItem(LEGACY_ATLAS_KEY);
  }
}

async function processLifeOSForRead(value: string): Promise<string> {
  if (!keyManager.hasKey()) return value;
  return unsealSensitiveFields(value);
}

async function processLifeOSForWrite(value: string): Promise<string> {
  if (!keyManager.hasKey()) return value;
  return sealSensitiveFields(value);
}

export async function readStorageSnapshotAsync(
  storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage
): Promise<StorageSnapshot> {
  if (!storage) return {};

  migrateLegacyAtlasCountries(storage);

  const snapshot: StorageSnapshot = {};
  for (const key of STORAGE_KEYS) {
    const value = storage.getItem(key);
    if (value === null) continue;

    if (key === 'life-os-storage') {
      snapshot[key] = await processLifeOSForRead(value);
    } else {
      snapshot[key] = value;
    }
  }
  return snapshot;
}

export function readStorageSnapshot(storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
  if (!storage) return {};

  migrateLegacyAtlasCountries(storage);

  return STORAGE_KEYS.reduce<StorageSnapshot>((snapshot, key) => {
    const value = storage.getItem(key);
    if (value !== null) {
      snapshot[key] = value;
    }
    return snapshot;
  }, {});
}

export async function writeStorageSnapshotAsync(
  snapshot: StorageSnapshot,
  storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage
): Promise<void> {
  if (!storage) return;

  for (const key of STORAGE_KEYS) {
    const value = snapshot[key];
    if (typeof value === 'string') {
      if (key === 'life-os-storage') {
        storage.setItem(key, await processLifeOSForWrite(value));
      } else {
        storage.setItem(key, value);
      }
    } else {
      storage.removeItem(key);
    }
  }

  storage.removeItem(LEGACY_ATLAS_KEY);
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

  storage.removeItem(LEGACY_ATLAS_KEY);
}

export async function sealLocalLifeOSStorage(): Promise<void> {
  if (typeof localStorage === 'undefined' || !keyManager.hasKey()) return;

  const raw = localStorage.getItem('life-os-storage');
  if (!raw) return;

  const sealed = await sealSensitiveFields(raw);
  if (sealed !== raw) {
    localStorage.setItem('life-os-storage', sealed);
  }
}

export async function unsealLocalLifeOSStorage(): Promise<void> {
  if (typeof localStorage === 'undefined') return;

  const raw = localStorage.getItem('life-os-storage');
  if (!raw || !keyManager.hasKey()) return;

  try {
    const parsed = JSON.parse(raw) as { state?: { _vault?: unknown } };
    if (!parsed.state?._vault) return;
  } catch {
    return;
  }

  const unsealed = await unsealSensitiveFields(raw);
  if (unsealed !== raw) {
    localStorage.setItem('life-os-storage', unsealed);
  }
}

export function clearStorageSnapshot(storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage) {
  if (!storage) return;

  STORAGE_KEYS.forEach((key) => {
    storage.removeItem(key);
  });
  storage.removeItem(LEGACY_ATLAS_KEY);
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

export interface RemoteSnapshotRow {
  payload: StorageSnapshot;
  sync_version?: number;
  updated_at?: string;
}

export async function loadSnapshotFromSupabase(supabase: SupabaseClient, userId: string) {
  return supabase
    .from(TABLE_NAME)
    .select('payload, sync_version, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function saveSnapshotToSupabase(
  supabase: SupabaseClient,
  userId: string,
  snapshot: StorageSnapshot,
  meta: SyncMeta
) {
  saveRecoverySnapshot(snapshot, meta);

  const payload: StorageSnapshot = { ...snapshot };
  if (payload['life-os-storage'] && keyManager.hasKey()) {
    payload['life-os-storage'] = await sealSensitiveFields(payload['life-os-storage']);
  }

  return supabase.from(TABLE_NAME).upsert(
    {
      user_id: userId,
      payload: {
        ...payload,
        [SYNC_META_KEY]: JSON.stringify(meta),
      },
      sync_version: meta.version,
      updated_at: meta.updatedAt,
    },
    { onConflict: 'user_id' }
  );
}

export async function unsealSnapshot(snapshot: StorageSnapshot): Promise<StorageSnapshot> {
  const result = { ...snapshot };
  if (result['life-os-storage'] && keyManager.hasKey()) {
    result['life-os-storage'] = await unsealSensitiveFields(result['life-os-storage']);
  }
  return result;
}

/** Merge remote snapshot with local atlas mapping (version-aware). */
export function mergeAtlasMapping(local: StorageSnapshot, remote: StorageSnapshot): StorageSnapshot {
  const localMeta = parseSyncMeta(local[SYNC_META_KEY]);
  const remoteMeta = parseSyncMeta(remote[SYNC_META_KEY]);

  const { snapshot } = mergeSnapshots(local, remote, localMeta, remoteMeta);

  const localMapping = local[ATLAS_MAPPING_KEY];
  const remoteMapping = remote[ATLAS_MAPPING_KEY];

  if (localMapping && remoteMapping) {
    try {
      const localObj = JSON.parse(localMapping) as Record<string, string>;
      const remoteObj = JSON.parse(remoteMapping) as Record<string, string>;
      snapshot[ATLAS_MAPPING_KEY] = JSON.stringify({ ...remoteObj, ...localObj });
    } catch {
      snapshot[ATLAS_MAPPING_KEY] = localMapping ?? remoteMapping;
    }
  }

  return snapshot;
}

export function buildSnapshotMeta(snapshot: StorageSnapshot): SyncMeta {
  const existing = parseSyncMeta(snapshot[SYNC_META_KEY]);
  return buildSyncMeta(snapshot, existing ?? undefined);
}

export async function unlockVaultFromPassword(password: string, userId: string): Promise<void> {
  await keyManager.unlockWithPassword(password, userId);
  await unsealLocalLifeOSStorage();
}

export async function unlockVaultFromPassphrase(passphrase: string, userId: string): Promise<void> {
  await keyManager.unlockWithPassphrase(passphrase, userId);
  await unsealLocalLifeOSStorage();
}

export async function reunlockVaultFromSession(userId: string): Promise<boolean> {
  const restored = await keyManager.reunlockFromSession(userId);
  if (restored) {
    await unsealLocalLifeOSStorage();
  }
  return restored;
}

export function lockVault(): void {
  keyManager.lock();
}

export { keyManager };
