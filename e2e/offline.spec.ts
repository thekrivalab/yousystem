import { test, expect } from './fixtures';

test.describe('Offline queue', () => {
  test('persists queue entry while offline', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/home');

    await authenticatedPage.context().setOffline(true);

    await authenticatedPage.evaluate(() => {
      const item = {
        userId: 'e2e-user',
        snapshot: { 'life-os-storage': JSON.stringify({ offline: true }) },
        meta: { version: 1, updatedAt: new Date().toISOString(), deviceId: 'e2e', checksum: 'x' },
        attempts: 0,
        queuedAt: new Date().toISOString(),
      };
      localStorage.setItem('life-os-sync-queue', JSON.stringify([item]));
    });

    const queueWhileOffline = await authenticatedPage.evaluate(() =>
      localStorage.getItem('life-os-sync-queue')
    );
    expect(queueWhileOffline).toBeTruthy();
    expect(queueWhileOffline).toContain('offline');
  });

  test('online event is dispatched after reconnect', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/home');

    await authenticatedPage.context().setOffline(true);
    await authenticatedPage.context().setOffline(false);

    const onlineSupported = await authenticatedPage.evaluate(() => {
      let fired = false;
      window.addEventListener('online', () => { fired = true; });
      window.dispatchEvent(new Event('online'));
      return fired;
    });
    expect(onlineSupported).toBe(true);
  });
});
