import {
  encryptWithPassword,
  decryptWithPassword,
  type EncryptedPayload,
} from './crypto/vault';
import {
  readStorageSnapshot,
  writeStorageSnapshot,
  STORAGE_KEYS,
  type StorageSnapshot,
} from './storage-snapshot';
import { rehydratePersistedStores } from './storage-snapshot';

export const BACKUP_VERSION = 1 as const;

export interface BackupEnvelope {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  encrypted: boolean;
  payload: StorageSnapshot | EncryptedPayload;
}

export function createPlainBackup(): BackupEnvelope {
  const snapshot = readStorageSnapshot();
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    encrypted: false,
    payload: snapshot,
  };
}

export async function createEncryptedBackup(passphrase: string): Promise<BackupEnvelope> {
  const snapshot = readStorageSnapshot();
  const serialized = JSON.stringify(
    STORAGE_KEYS.reduce<StorageSnapshot>((acc, key) => {
      const value = snapshot[key];
      if (typeof value === 'string') acc[key] = value;
      return acc;
    }, {})
  );

  const encrypted = await encryptWithPassword(serialized, passphrase);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    encrypted: true,
    payload: encrypted,
  };
}

export function downloadBackup(envelope: BackupEnvelope, filename?: string): void {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `yousystem-backup-v${BACKUP_VERSION}-${envelope.exportedAt.split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(
  envelope: BackupEnvelope,
  options?: { passphrase?: string }
): Promise<{ ok: boolean; error?: string }> {
  if (envelope.version !== BACKUP_VERSION) {
    return { ok: false, error: `Unsupported backup version: ${envelope.version}` };
  }

  try {
    let snapshot: StorageSnapshot;

    if (envelope.encrypted) {
      if (!options?.passphrase) {
        return { ok: false, error: 'Passphrase required for encrypted backup' };
      }
      const encrypted = envelope.payload as EncryptedPayload;
      const decrypted = await decryptWithPassword(encrypted, options.passphrase);
      snapshot = JSON.parse(decrypted) as StorageSnapshot;
    } else {
      snapshot = envelope.payload as StorageSnapshot;
    }

    writeStorageSnapshot(snapshot);
    await rehydratePersistedStores();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to restore backup',
    };
  }
}

export function parseBackupFile(content: string): BackupEnvelope | null {
  try {
    const parsed = JSON.parse(content) as BackupEnvelope;
    if (parsed.version !== BACKUP_VERSION) return null;
    if (!parsed.payload) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Legacy export: raw life-os-storage only (pre-v1). */
export function migrateLegacyExport(raw: string): BackupEnvelope | null {
  try {
    JSON.parse(raw);
    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      encrypted: false,
      payload: { 'life-os-storage': raw },
    };
  } catch {
    return null;
  }
}
