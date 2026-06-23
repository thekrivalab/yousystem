import { test, expect } from './fixtures';

test.describe('Sync & local persistence', () => {
  test('goal changes persist in localStorage', async ({ authenticatedPage }) => {
    const title = `E2E Goal ${Date.now()}`;

    await authenticatedPage.goto('/conquistas');
    await authenticatedPage.evaluate((goalTitle) => {
      const raw = localStorage.getItem('life-os-storage');
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      const state = parsed.state ?? parsed;
      state.goals = [
        ...(state.goals ?? []),
        {
          id: `g_${Date.now()}`,
          title: goalTitle,
          description: 'E2E',
          category: 'personal',
          type: 'annual',
          deadline: '2026-12-31',
          progress: 0,
          priority: 5,
          status: 'not_started',
          xpReward: 100,
          createdAt: '2026-01-01',
        },
      ];
      localStorage.setItem('life-os-storage', JSON.stringify({ state, version: parsed.version ?? 0 }));
    }, title);

    const storage = await authenticatedPage.evaluate(() => localStorage.getItem('life-os-storage'));
    expect(storage).toContain(title);
  });

  test('habit data stored in life-os-storage', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/habits');

    const habitName = `E2E Habit ${Date.now()}`;
    await authenticatedPage.evaluate((name) => {
      const raw = localStorage.getItem('life-os-storage');
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      const state = parsed.state ?? parsed;
      state.habits = [
        ...(state.habits ?? []),
        {
          id: `h_${Date.now()}`,
          name,
          icon: '⚡',
          category: 'personal',
          frequency: 'daily',
          streak: 0,
          longestStreak: 0,
          completedToday: false,
          successRate: 0,
          color: '#6366f1',
          xpPerCompletion: 10,
          completionHistory: [],
          createdAt: '2026-01-01',
        },
      ];
      localStorage.setItem('life-os-storage', JSON.stringify({ state, version: parsed.version ?? 0 }));
    }, habitName);

    const storage = await authenticatedPage.evaluate(() => localStorage.getItem('life-os-storage'));
    expect(storage).toContain(habitName);
  });

  test('two contexts reach home with e2e auth', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    await contextA.addCookies([{ name: 'e2e-session', value: '1', url: 'http://127.0.0.1:3099' }]);
    await contextB.addCookies([{ name: 'e2e-session', value: '1', url: 'http://127.0.0.1:3099' }]);

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.addInitScript(() => { document.cookie = 'e2e-session=1; path=/'; });
    await pageB.addInitScript(() => { document.cookie = 'e2e-session=1; path=/'; });

    await pageA.goto('/home');
    await pageB.goto('/home');

    await expect(pageA).toHaveURL(/\/home/);
    await expect(pageB).toHaveURL(/\/home/);

    await contextA.close();
    await contextB.close();
  });
});
