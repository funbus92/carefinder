import { test, expect } from '@playwright/test'

test('share link is human-readable and copyable', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/search?city=Lagos&specialty=maternity&radius=10')

  await page.getByRole('button', { name: /share/i }).click()
  const linkInput = page.locator('input[readonly]')
  await expect(linkInput).toHaveValue(/\/search\?city=Lagos&specialty=maternity&radius=10/)

  await page.getByRole('button', { name: /copy/i }).click()
  await expect(page.getByText(/copied/i)).toBeVisible()
})
