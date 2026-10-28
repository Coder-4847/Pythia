import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/** WCAG 2.1 A/AA automated checks on every page, in both themes. Automation finds about a third of issues; it is a floor, not a certificate. */
const PAGES = ['/', '/#/learn', '/#/lesson/hello-print', '/#/playground', '/#/dashboard', '/#/archive', '/#/achievements', '/#/profile', '/#/stats', '/#/settings', '/#/about', '/#/privacy', '/#/changelog', '/#/signin', '/#/no-such-page']

async function audit(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return result.violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
}

for (const theme of ['dark', 'light'] as const) {
  test(`no automated accessibility violations (${theme})`, async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/')
    await expect.poll(() => page.evaluate(() => window.crossOriginIsolated).catch(() => false), { timeout: 20_000 }).toBe(true)
    // Theme is a saved setting; flip it the way a learner would.
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await page.waitForTimeout(600)
    const problems: Record<string, string[]> = {}
    for (const path of PAGES) {
      await page.goto(path)
      await page.reload()
      await page.waitForTimeout(1200) // page transition and lazy chunks
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      const found = await audit(page)
      if (found.length) problems[path] = found
    }
    expect(problems).toEqual({})
  })
}
