import { describe, expect, it, beforeEach } from 'vitest';
import {
  enqueueSync,
  dequeueSync,
  readSyncQueue,
  writeSyncQueue,
  shouldRetrySync,
  syncRetryDelayMs,
  SYNC_QUEUE_KEY,
} from '../sync-engine';
import type { StorageSnapshot } from '../storage-snapshot';

const snapshot: StorageSnapshot = { 'life-os-storage': '{}' };
const meta = {
  version: 1,
  updatedAt: '2026-01-01T00:00:00Z',
  deviceId: 'test',
  checksum: 'abc',
};

describe('sync queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enqueues and dequeues by userId', () => {
    enqueueSync({ userId: 'u1', snapshot, meta });
    expect(readSyncQueue().length).toBe(1);

    const item = dequeueSync('u1');
    expect(item?.userId).toBe('u1');
    expect(readSyncQueue().length).toBe(0);
  });

  it('respects retry limits and backoff', () => {
    const item = { userId: 'u1', snapshot, meta, attempts: 7, queuedAt: new Date().toISOString() };
    writeSyncQueue([item]);
    expect(shouldRetrySync(item)).toBe(true);
    expect(syncRetryDelayMs(7)).toBeLessThanOrEqual(30_000);
    expect(shouldRetrySync({ ...item, attempts: 8 })).toBe(false);
  });

  it('preserves attempt count when re-enqueueing', () => {
    enqueueSync({ userId: 'u1', snapshot, meta, attempts: 3 });
    expect(readSyncQueue()[0]?.attempts).toBe(3);
  });

  it('persists queue in localStorage', () => {
    enqueueSync({ userId: 'u1', snapshot, meta });
    expect(localStorage.getItem(SYNC_QUEUE_KEY)).toBeTruthy();
  });
});
