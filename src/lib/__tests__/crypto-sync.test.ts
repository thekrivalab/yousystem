import { describe, expect, it } from 'vitest';
import { encryptWithPassword, decryptWithPassword } from '../crypto/vault';
import { mergeSnapshots, buildSyncMeta, parseSyncMeta, SYNC_META_KEY } from '../sync-engine';
import type { StorageSnapshot } from '../storage-snapshot';

describe('vault encryption', () => {
  it('round-trips plaintext with password', async () => {
    const payload = JSON.stringify({ secret: 'finance data', amount: 42 });
    const encrypted = await encryptWithPassword(payload, 'test-passphrase-123');
    const decrypted = await decryptWithPassword(encrypted, 'test-passphrase-123');
    expect(JSON.parse(decrypted)).toEqual({ secret: 'finance data', amount: 42 });
  });

  it('rejects wrong passphrase', async () => {
    const encrypted = await encryptWithPassword('data', 'correct');
    await expect(decryptWithPassword(encrypted, 'wrong')).rejects.toThrow();
  });
});

describe('versioned snapshot merge', () => {
  it('prefers higher sync version', () => {
    const local: StorageSnapshot = {
      'life-os-storage': JSON.stringify({ goals: [{ id: '1', title: 'Local' }] }),
      [SYNC_META_KEY]: JSON.stringify({ version: 2, updatedAt: '2026-01-01T00:00:00Z', deviceId: 'a', checksum: '1' }),
    };
    const remote: StorageSnapshot = {
      'life-os-storage': JSON.stringify({ goals: [{ id: '1', title: 'Remote' }] }),
      [SYNC_META_KEY]: JSON.stringify({ version: 3, updatedAt: '2026-01-02T00:00:00Z', deviceId: 'b', checksum: '2' }),
    };

    const { snapshot, meta } = mergeSnapshots(local, remote, parseSyncMeta(local[SYNC_META_KEY]), parseSyncMeta(remote[SYNC_META_KEY]));

    const state = JSON.parse(snapshot['life-os-storage']!);
    expect(state.goals[0].title).toBe('Remote');
    expect(meta.version).toBeGreaterThan(3);
  });

  it('builds monotonic sync meta', () => {
    const snapshot: StorageSnapshot = { 'life-os-storage': '{}' };
    const meta = buildSyncMeta(snapshot);
    expect(meta.version).toBe(1);

    const next = buildSyncMeta(snapshot, meta);
    expect(next.version).toBe(2);
  });
});
