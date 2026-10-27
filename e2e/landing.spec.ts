import { expect, test } from '@playwright/test'

test('landing: hero demo flags the bug and Pythia asks a question', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('sees your bugs coming')
  await expect(page.getByRole('note')).toContainText('What do you expect', { timeout: 15_000 })
  await expect(page.getByRole('link', { name: /Start coding — no signup/ }).first()).toBeVisible()
  expect(errors).toEqual([])
})

test('landing: section nav scrolls without breaking hash routing', async ({ page }) => {
  await page.goto('/')
  // Below-the-fold sections and smooth scrolling both load after the hero.
  await expect(page.locator('#faq')).toBeAttached()
  await expect(page.locator('html.lenis')).toBeAttached()
  await page.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'FAQ' }).click()
  await expect(page.locator('#faq')).toBeInViewport()
  expect(page.url()).not.toContain('#faq')
})

test('unknown routes show the custom 404', async ({ page }) => {
  await page.goto('/#/definitely-not-a-page')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('isn’t where you expected')
})
