import { expect, test, type Page } from '@playwright/test'

/** Replace the active editor's contents. insertText skips key handling (auto-indent, bracket closing). */
async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText(code)
}

async function openPlayground(page: Page) {
  await page.goto('/#/playground')
  // First visit: the cross-origin-isolation service worker installs and reloads the page once.
  await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(true)
}

const consoleLog = (page: Page) => page.getByRole('log')

test.describe('playground', () => {
  test('runs code and streams output', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'for i in range(3):\n    print("line", i)')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('line 2')
  })

  test('input() waits for an answer typed into the console', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'name = input("Name? ")\nprint("Hello,", name)')
    await page.keyboard.press('ControlOrMeta+Enter')
    const answer = page.getByLabel(/Answer for/)
    await answer.fill('Ada')
    await answer.press('Enter')
    await expect(consoleLog(page)).toContainText('Hello, Ada')
  })

  test('Stop interrupts an infinite loop and Python stays usable', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'while True:\n    pass')
    await page.getByRole('button', { name: /Run main\.py/ }).click()
    await page.getByRole('button', { name: 'Stop' }).click()
    await expect(consoleLog(page)).toContainText('Stopped.')
    await setCode(page, 'print("still alive")')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('still alive')
  })

  test('shows a trimmed traceback for runtime errors', async ({ page }) => {
    await openPlayground(page)
    await setCode(page, 'x = 10\nprint(x / 0)')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('ZeroDivisionError')
    await expect(consoleLog(page)).toContainText('File "main.py", line 2')
  })

  test('multi-file programs can import each other', async ({ page }) => {
    await openPlayground(page)
    await page.getByRole('button', { name: 'New file' }).click()
    await expect(page.getByRole('tab', { name: 'untitled.py' })).toBeVisible()
    await setCode(page, 'def hello():\n    return "from the other file"')
    await page.getByRole('tab', { name: 'main.py' }).click()
    await setCode(page, 'import untitled\nprint(untitled.hello())')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('from the other file')
  })

  test('share links reopen the same code', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openPlayground(page)
    await setCode(page, 'print("shared!")')
    await page.getByRole('button', { name: 'Share' }).click()
    await expect(page.getByText('Link copied')).toBeVisible()
    const link = await page.evaluate(() => navigator.clipboard.readText())
    expect(link).toContain('#/playground?c=')

    const fresh = await context.newPage()
    await fresh.goto(link)
    await expect(fresh.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
    await expect(fresh.locator('.cm-content')).toContainText('print("shared!")')
  })
})

test.describe('without cross-origin isolation', () => {
  // Blocking service workers keeps the page un-isolated, like a host that can't set COOP/COEP.
  test.use({ serviceWorkers: 'block' })

  test('input() reads pre-typed lines and Stop restarts Python', async ({ page }) => {
    await page.goto('/#/playground')
    await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
    expect(await page.evaluate(() => crossOriginIsolated)).toBe(false)

    await page.getByLabel(/Input for/).fill('Grace')
    await setCode(page, 'print("Hi", input("Name? "))')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('Hi Grace')

    await setCode(page, 'while True:\n    pass')
    await page.getByRole('button', { name: /Run main\.py/ }).click()
    await page.getByRole('button', { name: 'Stop' }).click()
    await expect(consoleLog(page)).toContainText('Stopped.')
    await expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })
    await setCode(page, 'print("back")')
    await page.keyboard.press('ControlOrMeta+Enter')
    await expect(consoleLog(page)).toContainText('back')
  })
})
