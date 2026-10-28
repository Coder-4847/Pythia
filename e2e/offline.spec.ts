import { expect, test } from '@playwright/test'

test('after one visit, the app and Python work with no network', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/#/playground')
  // First visit: the service worker takes over and the page reloads once, now cross-origin isolated.
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller) && window.crossOriginIsolated).catch(() => false), { timeout: 20_000 })
    .toBe(true)

  // Run Python once while online so the runtime is saved too.
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText('print("online run")')
  await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(page.getByRole('log')).toContainText('online run', { timeout: 60_000 })

  // The shell is cached in the background; wait until the app says it is ready.
  await page.goto('/#/settings')
  await expect(page.getByTestId('offline-status')).toContainText('Ready.', { timeout: 30_000 })

  await context.setOffline(true)
  await page.goto('/')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true)

  // A lesson and a Python run, entirely offline.
  await page.goto('/#/lesson/hello-print')
  await expect(page.getByRole('heading', { name: 'Your first program', level: 2 })).toBeVisible()
  await page.goto('/#/playground')
  await expect(page.locator('.cm-content')).toHaveCount(1) // the lesson's editors have left the page
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText('print("offline run")')
  await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(page.getByRole('log')).toContainText('offline run', { timeout: 60_000 })

  // Progress is saved locally, so it works offline too.
  await page.goto('/#/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})
