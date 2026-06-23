import { describe, expect, it, beforeEach } from 'vitest';
import { getLocalStorageUserId, ensureLocalStorageForUser } from '../auth-storage';

describe('auth-storage user isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads user id from zustand persist blob', () => {
    localStorage.setItem(
      'life-os-storage',
      JSON.stringify({ state: { user: { id: 'abc-123', name: 'A' } }, version: 0 })
    );

    expect(getLocalStorageUserId()).toBe('abc-123');
  });

  it('clears storage when a different user signs in', async () => {
    localStorage.setItem(
      'life-os-storage',
      JSON.stringify({ state: { user: { id: 'user-a' } }, version: 0 })
    );
    localStorage.setItem('life-os-theme', '{"state":{}}');

    const cleared = await ensureLocalStorageForUser('user-b');

    expect(cleared).toBe(true);
    expect(localStorage.getItem('life-os-storage')).toBeNull();
    expect(localStorage.getItem('life-os-theme')).toBeNull();
  });

  it('keeps storage when same user signs in', async () => {
    localStorage.setItem(
      'life-os-storage',
      JSON.stringify({ state: { user: { id: 'user-a' } }, version: 0 })
    );

    const cleared = await ensureLocalStorageForUser('user-a');

    expect(cleared).toBe(false);
    expect(getLocalStorageUserId()).toBe('user-a');
  });
});
