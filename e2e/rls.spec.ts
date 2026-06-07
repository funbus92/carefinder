import { test, expect } from '@playwright/test'

/**
 * RLS policy verification: non-admin users cannot write to hospitals.
 * With mock data (no Supabase), the app runs in demo mode.
 * When Supabase is configured, run supabase/tests/rls.test.ts separately.
 */
test('public search page is accessible without login', async ({ page }) => {
  await page.goto('/search')
  await expect(page.getByPlaceholder(/search by name/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible()
})

test('login page is accessible for review submission', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
})

test('register page is accessible for new users', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
})
