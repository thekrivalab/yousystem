import { test as base, expect, type Page } from '@playwright/test';
import { E2E_SESSION_COOKIE } from '../src/lib/e2e';

const DEFAULT_STORE = {
  state: {
    user: {
      id: 'e2e-user',
      name: 'E2E User',
      totalXp: 0,
      level: 1,
      lifeScore: 0,
      scores: {
        travel: 0,
        finance: 0,
        health: 0,
        learning: 0,
        goals: 0,
        habits: 0,
        projects: 0,
      },
    },
    goals: [],
    habits: [],
    financialGoals: [],
    transactions: [],
    books: [],
    courses: [],
    languages: [],
    healthEntries: [],
    projects: [],
    memories: [],
    relationships: [],
    achievements: [],
    dreamItems: [],
    bucketListItems: [],
    planningEvents: [],
    documents: [],
  },
  version: 0,
};

const E2E_USER = {
  id: 'e2e-user',
  email: 'e2e@yousystem.test',
  user_metadata: { full_name: 'E2E User' },
  app_metadata: { provider: 'email' },
};

async function mockStorageRoutes(page: Page) {
  await page.route('**/rest/v1/user_storage_snapshots**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ payload: {}, sync_version: 1 }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function mockGuestAuth(page: Page) {
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/user') || url.includes('/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, session: null }),
      });
      return;
    }
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'mock' }),
    });
  });
}

async function mockAuthenticatedAuth(page: Page) {
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/user') || url.includes('/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: E2E_USER,
          session: { user: E2E_USER, access_token: 'e2e', expires_in: 3600 },
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

export const test = base.extend<{ authenticatedPage: Page }>({
  page: async ({ page }, use) => {
    await mockStorageRoutes(page);
    await mockGuestAuth(page);
    await use(page);
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: E2E_SESSION_COOKIE,
        value: '1',
        url: 'http://127.0.0.1:3099',
      },
    ]);

    const page = await context.newPage();
    await mockStorageRoutes(page);
    await mockAuthenticatedAuth(page);

    await page.addInitScript((store) => {
      document.cookie = 'e2e-session=1; path=/';
      localStorage.setItem('life-os-storage', JSON.stringify(store));
    }, DEFAULT_STORE);

    await use(page);
    await context.close();
  },
});

export { expect };
