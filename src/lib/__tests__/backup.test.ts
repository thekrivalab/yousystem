import { describe, expect, it, beforeEach } from 'vitest';
import {
  createPlainBackup,
  createEncryptedBackup,
  restoreBackup,
  parseBackupFile,
  BACKUP_VERSION,
} from '../backup';
import { STORAGE_KEYS } from '../storage-snapshot';

describe('backup', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'life-os-storage',
      JSON.stringify({
        state: { goals: [{ id: 'g1', title: 'Test' }] },
        version: 0,
      })
    );
  });

  it('creates and restores plain backup', async () => {
    const envelope = createPlainBackup();
    expect(envelope.encrypted).toBe(false);
    expect(envelope.version).toBe(BACKUP_VERSION);

    localStorage.clear();
    const result = await restoreBackup(envelope);
    expect(result.ok).toBe(true);
    const raw = localStorage.getItem('life-os-storage');
    expect(raw).toContain('g1');
  });

  it('creates and restores encrypted backup', async () => {
    const envelope = await createEncryptedBackup('test-passphrase-12345');
    expect(envelope.encrypted).toBe(true);

    localStorage.clear();
    const result = await restoreBackup(envelope, { passphrase: 'test-passphrase-12345' });
    expect(result.ok).toBe(true);
  });

  it('rejects wrong passphrase', async () => {
    const envelope = await createEncryptedBackup('correct-passphrase');
    localStorage.clear();
    const result = await restoreBackup(envelope, { passphrase: 'wrong' });
    expect(result.ok).toBe(false);
  });

  it('parses backup file JSON', () => {
    const envelope = createPlainBackup();
    const parsed = parseBackupFile(JSON.stringify(envelope));
    expect(parsed?.version).toBe(BACKUP_VERSION);
    expect(parsed?.payload).toBeDefined();
  });

  it('includes all storage keys in plain backup', () => {
    STORAGE_KEYS.forEach((key) => {
      if (key !== 'life-os-sync-meta') {
        localStorage.setItem(key, '{}');
      }
    });
    const envelope = createPlainBackup();
    const payload = envelope.payload as Record<string, string>;
    expect(Object.keys(payload).length).toBeGreaterThan(0);
  });
});
