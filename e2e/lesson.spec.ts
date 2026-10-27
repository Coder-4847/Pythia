import { expect, test, type Page } from '@playwright/test'

async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.insertText(code)
}

const ready = (page: Page) => expect(page.getByText(/^Python 3\.\d+\.\d+$/)).toBeVisible({ timeout: 60_000 })

test('landing → lesson → run code → complete', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  // Landing → curriculum
  await page.goto('/')
  await page.getByRole('link', { name: /Start coding — no signup/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Your path', level: 1 })).toBeVisible()
  await expect(page.getByText('Start here')).toBeVisible()
  await page.getByRole('link', { name: /Start →/ }).click()

  // Lesson: concept with a live, runnable snippet
  await expect(page.getByRole('heading', { name: 'Your first program', level: 2 })).toBeVisible()
  await page.getByRole('button', { name: 'Run', exact: true }).first().click()
  await expect(page.getByRole('log').first()).toContainText('Hello, world!', { timeout: 60_000 })

  // Worked example
  await page.getByRole('button', { name: /See a worked example/ }).click()
  await ready(page)
  await page.getByRole('button', { name: 'Run', exact: true }).click()
  await expect(page.getByRole('log')).toContainText('Next line: 5')

  // Exercise 1: a wrong answer gets a specific, friendly explanation…
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: /Exercise 1/ }).click()
  await setCode(page, 'print("hello pythia")')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/tests pass/)).toContainText('2 of 3')
  await expect(page.getByText(/Line 1 of the output should be 'Hello, Pythia!'/)).toBeVisible()
  // …and asking for a nudge reveals the first rung of the ladder.
  await page.getByRole('button', { name: 'Give me a nudge' }).click()
  await expect(page.getByText('A nudge')).toBeVisible()

  // …then the right answer passes and awards XP (a nudge costs 2).
  await setCode(page, 'print("Hello, Pythia!")')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/All 3 tests pass · \+18 XP/)).toBeVisible()

  // Exercises 2 and 3
  const solutions = ['print("Python is")\nprint("fun")', 'print("I am", 14, "years old")']
  for (const [i, code] of solutions.entries()) {
    await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: `Exercise ${i + 2}` }).click()
    await setCode(page, code)
    await page.getByRole('button', { name: 'Check answer' }).click()
    await expect(page.getByText(/All \d tests pass/)).toBeVisible()
  }

  // Drafts autosave: leave an exercise with new code, come back, and it's still there.
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: 'Exercise 1' }).click()
  await setCode(page, 'print("draft that was never checked")')
  await page.waitForTimeout(800)
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: 'Example' }).click()
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: 'Exercise 1' }).click()
  await expect(page.locator('.cm-content')).toContainText('draft that was never checked')

  // Checkpoint quiz
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: 'Checkpoint' }).click()
  await page.getByRole('radio', { name: '5 + 3', exact: true }).click()
  await page.getByRole('radio', { name: '# print("hello")' }).click()
  await page.getByRole('radio', { name: 'The string is missing its closing quote' }).click()
  await page.getByRole('button', { name: 'Check my answers' }).click()
  await expect(page.getByText(/You got/)).toContainText('3')

  // Completion
  await expect(page.getByText('Lesson complete')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { name: 'Your first program', level: 2 })).toBeVisible()

  // Progress survives a reload and shows on the curriculum.
  await page.goto('/#/learn')
  await page.reload()
  await expect(page.getByText('1/16 lessons').first()).toBeVisible()
  await expect(page.getByText('Completed').first()).toBeVisible()
  expect(errors).toEqual([])
})

test('settings: export, reset and re-import round-trip the learner’s data', async ({ page }) => {
  await page.goto('/#/lesson/variables')
  await expect(page.getByRole('heading', { name: 'Variables', level: 2 })).toBeVisible()
  await page.getByRole('navigation', { name: 'Lesson steps' }).getByRole('button', { name: 'Exercise 1' }).click()
  await setCode(page, 'name = "Ada"\nage = 14')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText(/All \d tests pass/)).toBeVisible({ timeout: 60_000 })

  await page.goto('/#/settings')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export all data' }).click()])
  const path = await download.path()

  await page.getByRole('button', { name: 'Reset all data…' }).click()
  await page.getByRole('button', { name: 'Delete everything' }).click()
  await expect(page.getByText('All data on this device was deleted')).toBeVisible()

  await page.getByLabel('Choose a Pythia export file').setInputFiles(path)
  await expect(page.getByRole('table', { name: 'What this import would change' })).toContainText('Exercise attempts')
  await page.getByRole('button', { name: 'Merge into my data' }).click()
  await expect(page.getByText('Import merged into your data')).toBeVisible()

  await page.goto('/#/learn')
  await expect(page.getByText('In progress').first()).toBeVisible()
})
