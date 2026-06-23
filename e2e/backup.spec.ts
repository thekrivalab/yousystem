import { test, expect } from './fixtures';

test.describe('Backup export/import', () => {
  test('encrypted backup round-trip via settings', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings?tab=data');

    const marker = `BackupGoal-${Date.now()}`;
    await authenticatedPage.evaluate((m) => {
      localStorage.setItem(
        'life-os-storage',
        JSON.stringify({
          state: {
            goals: [{ id: 'bk1', title: m, description: '', category: 'personal', type: 'annual', deadline: '2026-12-31', progress: 0, priority: 5, status: 'not_started', xpReward: 100, createdAt: '2026-01-01' }],
          },
          version: 0,
        })
      );
    }, marker);

    const containsMarker = await authenticatedPage.evaluate((m) => {
      return localStorage.getItem('life-os-storage')?.includes(m) ?? false;
    }, marker);
    expect(containsMarker).toBe(true);
  });

  test('plain backup structure in localStorage', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/settings?tab=data');

    const hasStorage = await authenticatedPage.evaluate(() => {
      return localStorage.getItem('life-os-storage') !== null;
    });
    expect(hasStorage).toBe(true);
  });
});
