import { expect, test, type Page } from '@playwright/test'

async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText(code)
}

test('every page renders, without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const pages: [string, string][] = [
    ['/#/dashboard', 'Welcome back'],
    ['/#/archive', 'Everything you’ve done'],
    ['/#/achievements', 'Little milestones'],
    ['/#/profile', 'Learner'],
    ['/#/stats', 'How you’re doing'],
    ['/#/settings', 'Settings'],
    ['/#/about', 'Why Pythia asks instead of tells'],
    ['/#/privacy', 'What happens to your data'],
    ['/#/changelog', 'What’s new'],
  ]
  for (const [url, heading] of pages) {
    await page.goto(url)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('without accounts configured, the site is guest-only and says so', async ({ page }) => {
  await page.goto('/#/signin')
  await expect(page.getByRole('heading', { level: 1, name: 'No account needed' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' })).toHaveCount(0)
  await page.goto('/#/profile')
  await expect(page.getByText(/accounts aren’t switched on/)).toBeVisible()
  await page.goto('/#/privacy')
  await expect(page.getByText(/not switched on for this copy/)).toBeVisible()
})

test('a new learner sees an inviting empty dashboard and archive', async ({ page }) => {
  await page.goto('/#/dashboard')
  await expect(page.getByText(/Your first lesson takes about eight minutes/)).toBeVisible()
  await page.goto('/#/archive')
  await expect(page.getByText('Nothing here yet')).toBeVisible()
})

test('command palette (Ctrl/⌘ K) navigates, and ? lists shortcuts', async ({ page }) => {
  await page.goto('/#/about')
  const palette = page.getByRole('dialog', { name: 'Command palette' })
  // The first visit reloads once while the cross-origin-isolation service worker installs; keep trying until the shortcut lands.
  await expect(async () => {
    await page.keyboard.press('ControlOrMeta+K')
    await expect(palette).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole('combobox', { name: /Search commands/ }).fill('statis')
  await expect(page.getByRole('option').first()).toContainText(/Statistics/i)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/stats$/)
  await expect(palette).toBeHidden()

  // Lessons are searchable too.
  await page.keyboard.press('ControlOrMeta+K')
  await page.getByRole('combobox', { name: /Search commands/ }).fill('list comprehensions')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/lesson\//)

  await page.goto('/#/about')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeHidden()
})

test('settings persist across a reload', async ({ page }) => {
  await page.goto('/#/settings')
  await page.getByRole('radio', { name: 'Light' }).check({ force: true })
  await page.getByRole('radio', { name: 'Vim' }).check({ force: true })
  await page.getByRole('radio', { name: 'Chatty' }).check({ force: true })
  await page.getByLabel('Font size').selectOption('18')
  await page.getByLabel('Display name').fill('Ada')
  await page.getByLabel('Display name').blur()
  await page.getByRole('radio', { name: '60 XP' }).click({ force: true })
  await expect(page.getByRole('radio', { name: '60 XP' })).toBeChecked()
  await page.waitForTimeout(800) // settings are written through after a short debounce
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('radio', { name: 'Vim' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Chatty' })).toBeChecked()
  await expect(page.getByLabel('Font size')).toHaveValue('18')
  await expect(page.getByLabel('Display name')).toHaveValue('Ada')
  await expect(page.getByRole('radio', { name: '60 XP' })).toBeChecked()
  await page.goto('/#/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back, Ada')
})

test('a first attempt shows up on the dashboard, in the archive, and unlocks an achievement', async ({ page }) => {
  await page.goto('/#/lesson/hello-print')
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: /Exercise 1/ }).click()
  await setCode(page, 'print("hello pythia")')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/tests pass/)).toContainText('2 of 3', { timeout: 60_000 })
  await setCode(page, 'print("Hello, Pythia!")')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/All 3 tests pass/)).toBeVisible()

  await page.goto('/#/dashboard')
  await expect(page.getByText('Recommended next')).toBeVisible()
  await expect(page.getByRole('link', { name: /Continue/ }).first()).toBeVisible()

  await page.goto('/#/achievements')
  await expect(page.getByText(/[2-9] of \d+ unlocked/)).toBeVisible()

  await page.goto('/#/archive')
  await page.getByRole('searchbox').fill('hello pythia')
  await expect(page.getByText('matches code you wrote')).toBeVisible()
  await page.getByRole('link', { name: /Your first program/ }).click()
  await page.getByRole('button', { name: 'Compare first and latest' }).click()
  const diff = page.getByLabel('Changes from your first attempt to your latest')
  await expect(diff).toContainText('hello pythia')
  await expect(diff).toContainText('Hello, Pythia!')
})

test('a lesson from a later track works end to end, and the curriculum shows what is coming', async ({ page }) => {
  await page.goto('/#/learn')
  await expect(page.getByRole('heading', { name: 'Intermediate Python', level: 2 })).toBeVisible()
  await expect(page.getByText('Coming next').first()).toBeVisible()
  await page.getByRole('link', { name: /Catching exceptions/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Catching exceptions', level: 2 })).toBeVisible()
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: /Exercise 1/ }).click()
  await setCode(page, 'def to_int(text):\n    return int(text)')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/tests pass/)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText(/All \d+ tests pass/)).toHaveCount(0)
  await setCode(page, 'def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/All \d+ tests pass/)).toBeVisible({ timeout: 60_000 })
})
