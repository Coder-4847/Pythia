import { expect, test, type Page } from '@playwright/test'

async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText(code)
}

async function openPlayground(page: Page) {
  await page.goto('/#/playground')
  await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
}

test.describe('Pythia', () => {
  test('flags the off-by-one before the code runs and asks, without telling', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'total = 0\nfor i in range(1, 10):\n    total += i\nprint("Sum of 1 to 10:", total)\n')

    // A pulsing dot appears in the gutter by itself; nothing has been run.
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(1, { timeout: 15_000 })
    await expect(page.getByRole('log')).not.toContainText('Sum')

    // The dot pulses forever, so Playwright never sees it as "stable"; force the hover.
    await page.locator('.cm-pythia-dot').hover({ force: true })
    const card = page.getByRole('dialog', { name: /Pythia, about line 2/ })
    await expect(card).toContainText('What do you expect i to be on the last loop?')
    await expect(card).not.toContainText('range(1, 11)') // it asks; it never gives the fix

    // The ladder is opt-in: hint first, explanation only after "I'm stuck".
    await card.getByRole('button', { name: 'Give me a hint' }).click()
    await expect(card).toContainText('stops before 10')
    await expect(card).not.toContainText('never includes')
    await card.getByRole('button', { name: /I’m stuck/ }).click()
    await expect(card).toContainText('never includes')
  })

  test('catches an undefined name with pyflakes and can be dismissed', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'total = 5\nprint(totl)\n')
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(1, { timeout: 15_000 })
    await page.getByRole('button', { name: /Pythia has a question · line 2/ }).click()
    const card = page.getByRole('dialog', { name: /about line 2/ })
    await expect(card).toContainText('Where does totl get its value')
    await card.getByRole('button', { name: 'Not now' }).click()
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(0)
  })

  test('the dot goes away when the bug is fixed, and correct code stays quiet', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'for i in range(3):\n    print(i)\n')
    await expect(page.getByText('Pythia is watching')).toBeVisible({ timeout: 15_000 })
    await setCode(page, 'print(undefined_thing)\n')
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(1, { timeout: 15_000 })
    await setCode(page, 'undefined_thing = 1\nprint(undefined_thing)\n')
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(0, { timeout: 15_000 })
  })

  test('keyboard users can open the question with Ctrl/Cmd + .', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'age = input("Age? ")\nprint(age + 1)\n')
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(1, { timeout: 15_000 })
    await page.locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+.')
    await expect(page.getByRole('dialog', { name: /about line 2/ })).toContainText('What type does input() hand back')
  })

  test('the intensity setting changes what Pythia mentions', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'list = [1, 2]\nprint(list)\n') // helpful (level 2), not a crash
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(1, { timeout: 15_000 })
    await page.getByRole('button', { name: 'Pythia settings' }).click()
    await page.getByRole('radio', { name: /Quiet/ }).click()
    await expect(page.locator('.cm-pythia-dot')).toHaveCount(0)
  })

  test('after a crash, the console translates the error into a question', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'items = [1, 2, 3]\nprint(items[5])\n')
    await page.keyboard.press('ControlOrMeta+Enter')
    const log = page.getByRole('log')
    await expect(log).toContainText('IndexError')
    await expect(log).toContainText('In plain English')
    await expect(log).toContainText('How many items are there, and what index are you asking for?')
  })
})
