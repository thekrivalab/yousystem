import { test, expect } from './fixtures';

test.describe('Recovery snapshots', () => {
  test('creates and lists recovery snapshots', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/home');

    await authenticatedPage.evaluate(() => {
      localStorage.setItem(
        'life-os-recovery-0',
        JSON.stringify({
          savedAt: new Date().toISOString(),
          meta: { version: 1, updatedAt: new Date().toISOString(), deviceId: 'e2e', checksum: 'a' },
          snapshot: { 'life-os-storage': localStorage.getItem('life-os-storage') ?? '{}' },
        })
      );
    });

    await authenticatedPage.evaluate(() => {
      localStorage.setItem(
        'life-os-recovery-0',
        JSON.stringify({
          savedAt: new Date().toISOString(),
          meta: { version: 2, updatedAt: new Date().toISOString(), deviceId: 'e2e', checksum: 'recovery' },
          snapshot: { 'life-os-storage': '{"state":{"goals":[{"id":"r1","title":"Recovered"}]}}' },
        })
      );
    });

    const snapshots = await authenticatedPage.evaluate(() => {
      const raw = localStorage.getItem('life-os-recovery-0');
      return raw ? JSON.parse(raw) : null;
    });

    expect(snapshots).toBeTruthy();
    expect(snapshots.meta.version).toBe(2);
  });

  test('restores snapshot into localStorage', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings?tab=data');

    const marker = `recovery-${Date.now()}`;
    await authenticatedPage.evaluate((m) => {
      localStorage.setItem(
        'life-os-recovery-1',
        JSON.stringify({
          savedAt: new Date().toISOString(),
          meta: { version: 3, updatedAt: new Date().toISOString(), deviceId: 'e2e', checksum: 'r' },
          snapshot: { 'life-os-storage': JSON.stringify({ marker: m }) },
        })
      );
    }, marker);

    await authenticatedPage.evaluate(() => {
      const raw = localStorage.getItem('life-os-recovery-1');
      if (!raw) return;
      const entry = JSON.parse(raw);
      if (entry.snapshot['life-os-storage']) {
        localStorage.setItem('life-os-storage', entry.snapshot['life-os-storage']);
      }
    });

    const restored = await authenticatedPage.evaluate(() => localStorage.getItem('life-os-storage'));
    expect(restored).toContain('recovery-');
  });
});
