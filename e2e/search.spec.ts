import { test, expect } from '@playwright/test'

test('search hospitals by city', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('button', { name: /filters/i }).click()
  await page.getByPlaceholder('e.g. Lagos').fill('Lagos')
  await page.getByRole('button', { name: /^search$/i }).click()
  await expect(page.getByText(/hospital/i).first()).toBeVisible()
  await expect(page.getByText('Lagos University Teaching Hospital')).toBeVisible()
})

test('search filters by specialty in URL', async ({ page }) => {
  await page.goto('/search?city=Lagos&specialty=maternity')
  await expect(page.getByText('Reddington Hospital')).toBeVisible()
})

test('hospital detail page shows information', async ({ page }) => {
  await page.goto('/hospitals/1')
  await expect(page.getByRole('heading', { name: /Lagos University Teaching Hospital/i })).toBeVisible()
  await expect(page.getByText(/08012345678/)).toBeVisible()
})
