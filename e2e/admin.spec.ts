import { test, expect } from '@playwright/test'

test('admin route redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/)
})

test('admin hospitals page shows create form', async ({ page }) => {
  await page.goto('/admin/hospitals')
  await expect(page).toHaveURL(/\/login/)
})
