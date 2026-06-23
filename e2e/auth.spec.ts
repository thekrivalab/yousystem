import { test, expect } from './fixtures';

test.describe('Authentication UI', () => {
  test('login page serves HTML shell', async ({ request }) => {
    const response = await request.get('/login');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(/YouSystem|login/i);
  });

  test('register page serves HTML shell', async ({ request }) => {
    const response = await request.get('/register');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(/YouSystem|register|criar|cuenta/i);
  });

  test('authenticated user reaches home', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/home');
    await expect(authenticatedPage).toHaveURL(/\/home/);
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/habits');
    await expect(page).toHaveURL(/\/login/);
  });

  test('session persists after reload', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/home');
    await authenticatedPage.reload();
    await expect(authenticatedPage).toHaveURL(/\/home/);
  });
});
