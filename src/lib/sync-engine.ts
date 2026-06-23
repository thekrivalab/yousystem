import type { StorageSnapshot } from './storage-snapshot';

export const SYNC_META_KEY = 'life-os-sync-meta' as const;
export const SYNC_QUEUE_KEY = 'life-os-sync-queue' as const;
export const RECOVERY_PREFIX = 'life-os-recovery' as const;
export const MAX_RECOVERY_SNAPSHOTS = 5;
export const MAX_SYNC_RETRIES = 8;

export interface SyncMeta {
  version: number;
  updatedAt: string;
  deviceId: string;
  checksum: string;
}

export interface SyncQueueItem {
  userId: string;
  snapshot: StorageSnapshot;
  meta: SyncMeta;
  attempts: number;
  queuedAt: string;
}

function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function getDeviceId(): string {
  if (typeof localStorage === 'undefined') return 'server';

  const key = 'life-os-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function buildSyncMeta(snapshot: StorageSnapshot, previous?: SyncMeta): SyncMeta {
  const serialized = JSON.stringify(snapshot);
  return {
    version: (previous?.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    checksum: fnv1a(serialized),
  };
}

export function parseSyncMeta(raw: string | undefined | null): SyncMeta | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SyncMeta;
  } catch {
    return null;
  }
}

/** Versioned merge: prefer higher version; tie-break by updatedAt. */
export function mergeSnapshots(
  local: StorageSnapshot,
  remote: StorageSnapshot,
  localMeta: SyncMeta | null,
  remoteMeta: SyncMeta | null
): { snapshot: StorageSnapshot; meta: SyncMeta } {
  const localWins =
    !remoteMeta ||
    !localMeta ||
    localMeta.version > remoteMeta.version ||
    (localMeta.version === remoteMeta.version &&
      new Date(localMeta.updatedAt).getTime() >= new Date(remoteMeta.updatedAt).getTime());

  const base = localWins ? { ...remote, ...local } : { ...local, ...remote };

  const winnerMeta = localWins ? localMeta : remoteMeta;
  const loserMeta = localWins ? remoteMeta : localMeta;

  const merged = mergeRecordCollections(base, local, remote, localMeta, remoteMeta);
  const meta = buildSyncMeta(merged, winnerMeta ?? loserMeta ?? undefined);

  return { snapshot: merged, meta };
}

/** Deep-merge arrays of records by id with version + updated_at per item. */
export function mergeRecordCollections(
  base: StorageSnapshot,
  local: StorageSnapshot,
  remote: StorageSnapshot,
  localMeta: SyncMeta | null,
  remoteMeta: SyncMeta | null
): StorageSnapshot {
  const lifeKey = 'life-os-storage';
  const localLife = local[lifeKey];
  const remoteLife = remote[lifeKey];

  if (!localLife || !remoteLife) return base;

  try {
    const localState = JSON.parse(localLife) as Record<string, unknown>;
    const remoteState = JSON.parse(remoteLife) as Record<string, unknown>;
    const mergedState = { ...localState };

    const arrayFields = [
      'goals', 'habits', 'transactions', 'financialGoals', 'healthEntries',
      'projects', 'memories', 'relationships', 'achievements', 'dreamItems',
      'bucketListItems', 'planningEvents', 'documents', 'books', 'courses', 'languages',
    ];

    for (const field of arrayFields) {
      const localArr = localState[field];
      const remoteArr = remoteState[field];
      if (!Array.isArray(localArr) || !Array.isArray(remoteArr)) continue;

      mergedState[field] = mergeRecordsById(
        localArr as VersionedRecord[],
        remoteArr as VersionedRecord[],
        localMeta,
        remoteMeta
      );
    }

    base[lifeKey] = JSON.stringify(mergedState);
  } catch {
    // Keep base merge if parse fails
  }

  return base;
}

interface VersionedRecord {
  id: string;
  updated_at?: string;
  version?: number;
  [key: string]: unknown;
}

function mergeRecordsById(
  local: VersionedRecord[],
  remote: VersionedRecord[],
  localMeta: SyncMeta | null,
  remoteMeta: SyncMeta | null
): VersionedRecord[] {
  const byId = new Map<string, VersionedRecord>();

  for (const record of remote) {
    if (record.id) byId.set(record.id, stampRecord(record, remoteMeta));
  }

  for (const record of local) {
    if (!record.id) continue;
    const existing = byId.get(record.id);
    const stamped = stampRecord(record, localMeta);

    if (!existing) {
      byId.set(record.id, stamped);
      continue;
    }

    const localVer = stamped.version ?? 0;
    const remoteVer = existing.version ?? 0;

    if (localVer > remoteVer) {
      byId.set(record.id, stamped);
    } else if (remoteVer > localVer) {
      byId.set(record.id, existing);
    } else {
      const localTime = new Date(stamped.updated_at ?? 0).getTime();
      const remoteTime = new Date(existing.updated_at ?? 0).getTime();
      byId.set(record.id, localTime >= remoteTime ? stamped : existing);
    }
  }

  return Array.from(byId.values());
}

function stampRecord(record: VersionedRecord, meta: SyncMeta | null): VersionedRecord {
  return {
    ...record,
    version: record.version ?? meta?.version ?? 1,
    updated_at: record.updated_at ?? meta?.updatedAt ?? new Date().toISOString(),
  };
}

export function readSyncQueue(): SyncQueueItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncQueueItem[]) : [];
  } catch {
    return [];
  }
}

export function writeSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueSync(
  item: Omit<SyncQueueItem, 'attempts' | 'queuedAt'> & { attempts?: number }
): void {
  const queue = readSyncQueue();
  queue.push({
    ...item,
    attempts: item.attempts ?? 0,
    queuedAt: new Date().toISOString(),
  });
  writeSyncQueue(queue);
}

export function dequeueSync(userId: string): SyncQueueItem | null {
  const queue = readSyncQueue();
  const index = queue.findIndex((item) => item.userId === userId);
  if (index === -1) return null;

  const [item] = queue.splice(index, 1);
  writeSyncQueue(queue);
  return item ?? null;
}

export function incrementSyncAttempt(item: SyncQueueItem): SyncQueueItem {
  return { ...item, attempts: item.attempts + 1 };
}

export function shouldRetrySync(item: SyncQueueItem): boolean {
  return item.attempts < MAX_SYNC_RETRIES;
}

export function syncRetryDelayMs(attempts: number): number {
  return Math.min(30_000, 1000 * 2 ** attempts);
}

export function saveRecoverySnapshot(snapshot: StorageSnapshot, meta: SyncMeta): void {
  if (typeof localStorage === 'undefined') return;

  const entries: { savedAt: string; meta: SyncMeta; snapshot: StorageSnapshot }[] = [];
  for (let i = 0; i < MAX_RECOVERY_SNAPSHOTS; i += 1) {
    const raw = localStorage.getItem(`${RECOVERY_PREFIX}-${i}`);
    if (raw) {
      try {
        entries.push(JSON.parse(raw));
      } catch {
        // skip corrupt entry
      }
    }
  }

  entries.unshift({
    savedAt: new Date().toISOString(),
    meta,
    snapshot,
  });

  const trimmed = entries.slice(0, MAX_RECOVERY_SNAPSHOTS);
  trimmed.forEach((entry, index) => {
    localStorage.setItem(`${RECOVERY_PREFIX}-${index}`, JSON.stringify(entry));
  });
}

export function listRecoverySnapshots(): { index: number; savedAt: string; meta: SyncMeta }[] {
  if (typeof localStorage === 'undefined') return [];

  const list: { index: number; savedAt: string; meta: SyncMeta }[] = [];
  for (let i = 0; i < MAX_RECOVERY_SNAPSHOTS; i += 1) {
    const raw = localStorage.getItem(`${RECOVERY_PREFIX}-${i}`);
    if (!raw) continue;
    try {
      const entry = JSON.parse(raw) as { savedAt: string; meta: SyncMeta };
      list.push({ index: i, savedAt: entry.savedAt, meta: entry.meta });
    } catch {
      // skip
    }
  }
  return list;
}

export function loadRecoverySnapshot(index: number): StorageSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(`${RECOVERY_PREFIX}-${index}`);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as { snapshot: StorageSnapshot };
    return entry.snapshot;
  } catch {
    return null;
  }
}
