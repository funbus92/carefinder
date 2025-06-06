import { test, expect } from '@playwright/test'

test('export CSV triggers download', async ({ page }) => {
  await page.goto('/search?city=Lagos')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /export csv/i }).click()
  await page.getByRole('button', { name: /download csv/i }).click()

  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^hospitals-lagos-\d{4}-\d{2}-\d{2}\.csv$/)
})
