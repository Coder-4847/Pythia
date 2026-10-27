import { expect, test, type BrowserContext, type Browser, type Page } from '@playwright/test'
import { FakeSupabase } from './fakeSupabase'

/** Runs against a build whose Supabase URL points at the in-memory fake (see playwright.config.ts). */

async function newDevice(browser: Browser, cloud: FakeSupabase): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext()
  await cloud.attach(context)
  const page = await context.newPage()
  return { context, page }
}

async function signUp(page: Page, email: string, password = 'correct horse') {
  await page.goto('/#/signup')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/#\/dashboard/)
}

async function signIn(page: Page, email: string, password = 'correct horse') {
  await page.goto('/#/signin')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  if (password === 'correct horse') await expect(page).toHaveURL(/#\/dashboard/)
}

/** Write progress straight into IndexedDB, as if this browser had been used as a guest. */
async function seedGuestProgress(page: Page, lessonId: string, attemptId: string) {
  await page.goto('/#/archive')
  await page.waitForTimeout(800) // let the app create its database
  await page.evaluate(
    async ({ lessonId, attemptId }) => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const open = indexedDB.open('pythia')
        open.onsuccess = () => res(open.result)
        open.onerror = () => rej(open.error)
      })
      const tx = db.transaction(['lessonProgress', 'attempts'], 'readwrite')
      tx.objectStore('lessonProgress').put({ lessonId, status: 'in_progress', percent: 25, step: 1, startedAt: 1000, updatedAt: 1000 })
      tx.objectStore('attempts').put({ id: attemptId, lessonId, exerciseId: 'x', code: 'print(1)', at: 1000, passed: false, results: [], hintsUsed: 0, xpAwarded: 0, updatedAt: 1000 })
      await new Promise((r) => (tx.oncomplete = r))
      db.close()
    },
    { lessonId, attemptId },
  )
  await page.reload()
}

/** Open the header's account popover (a no-op if it is already open). */
async function openAccountMenu(page: Page) {
  const sync = page.locator('header').getByRole('button', { name: 'Sync now' })
  if (!(await sync.isVisible())) await page.getByRole('button', { name: /^Account:/ }).click()
  await expect(sync).toBeVisible()
}

async function setName(page: Page, name: string) {
  await page.goto('/#/profile')
  await page.getByLabel('Display name').fill(name)
  await page.getByLabel('Display name').blur()
}

test('sign-up pages work, and errors are plain', async ({ browser }) => {
  const cloud = new FakeSupabase()
  const { page } = await newDevice(browser, cloud)
  await page.goto('/#/signup')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('alert')).toContainText('valid email')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('alert')).toContainText('at least 8')

  await signUp(page, 'ada@example.com')
  await expect(page.getByRole('button', { name: /^Account: ada@example.com/ })).toBeVisible()

  // Wrong password: the message doesn't say which half was wrong.
  const other = await newDevice(browser, cloud)
  await signIn(other.page, 'ada@example.com', 'not the password')
  await expect(other.page.getByRole('alert')).toHaveText('That email and password don’t match.')
  await expect(other.page.getByRole('heading', { level: 1 })).toHaveText('Welcome back')
})

test('email confirmation and password reset show reassuring, non-leaky messages', async ({ browser }) => {
  const cloud = new FakeSupabase()
  cloud.confirmEmails = true
  const { page } = await newDevice(browser, cloud)
  await page.goto('/#/signup')
  await page.getByLabel('Email').fill('new@example.com')
  await page.getByLabel('Password', { exact: true }).fill('correct horse')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Check your email')).toBeVisible()

  await page.goto('/#/forgot')
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText(/If that address has an account/)).toBeVisible()

  // The reset page is only usable from a recovery link.
  await page.goto('/#/reset')
  await expect(page.getByText(/works from the link in a password-recovery email/)).toBeVisible()
})

test('settings travel between devices, and a new device just follows the account', async ({ browser }) => {
  const cloud = new FakeSupabase()
  const a = await newDevice(browser, cloud)
  await signUp(a.page, 'ada@example.com')
  await setName(a.page, 'Ada')
  await expect.poll(() => cloud.rowsFor('ada@example.com', 'profile').length, { timeout: 20_000 }).toBe(1)
  await expect(a.page.getByRole('button', { name: /^Account:/ })).toBeVisible()

  const b = await newDevice(browser, cloud)
  await signIn(b.page, 'ada@example.com')
  await expect(b.page).toHaveURL(/#\/dashboard/)
  await b.page.goto('/#/profile')
  await expect(b.page.getByRole('heading', { level: 1 })).toHaveText('Ada', { timeout: 20_000 })
  // Nothing to decide on a device with no progress: no dialog.
  await expect(b.page.getByRole('dialog')).toHaveCount(0)

  // A change on B reaches A without a reload (A polls and syncs while visible).
  await setName(b.page, 'Ada Lovelace')
  await expect.poll(() => (cloud.rowsFor('ada@example.com', 'profile')[0]!.data as { displayName: string }).displayName, { timeout: 20_000 }).toBe('Ada Lovelace')
  await a.page.goto('/#/profile')
  await openAccountMenu(a.page)
  await a.page.locator('header').getByRole('button', { name: 'Sync now' }).click()
  await expect(a.page.getByRole('heading', { level: 1 })).toHaveText('Ada Lovelace', { timeout: 20_000 })
})

test('first sign-in on a device that has progress asks, and each answer does what it says', async ({ browser }) => {
  const cloud = new FakeSupabase()
  const a = await newDevice(browser, cloud)
  await signUp(a.page, 'ada@example.com')
  await setName(a.page, 'Ada')
  await expect.poll(() => cloud.rowsFor('ada@example.com', 'profile').length, { timeout: 20_000 }).toBe(1)

  // Combine: the guest's progress is uploaded and the account's profile arrives.
  const c = await newDevice(browser, cloud)
  await seedGuestProgress(c.page, 'hello-print', 'seed-c')
  await signIn(c.page, 'ada@example.com')
  const dialog = c.page.getByRole('dialog', { name: 'Combine this device with your account?' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('1 lesson and 1 attempt')
  expect(cloud.rowsFor('ada@example.com', 'attempts')).toHaveLength(0) // nothing is uploaded before they choose
  await dialog.getByRole('button', { name: 'Combine both (recommended)' }).click()
  await expect.poll(() => cloud.rowsFor('ada@example.com', 'attempts').map((r) => r.key), { timeout: 20_000 }).toEqual(['seed-c'])
  await c.page.goto('/#/profile')
  await expect(c.page.getByRole('heading', { level: 1 })).toHaveText('Ada', { timeout: 20_000 })

  // Use the account's copy: local progress that isn't in the account disappears.
  const d = await newDevice(browser, cloud)
  await seedGuestProgress(d.page, 'variables', 'seed-d')
  await signIn(d.page, 'ada@example.com')
  await d.page.getByRole('button', { name: 'Use my account’s copy only' }).click()
  await d.page.goto('/#/archive')
  await expect(d.page.getByRole('link', { name: /Your first program/ })).toBeVisible({ timeout: 20_000 })
  await expect(d.page.getByRole('link', { name: /Variables/ })).toHaveCount(0)
  expect(cloud.rowsFor('ada@example.com', 'attempts').map((r) => r.key)).toEqual(['seed-c'])

  // Not now: nothing leaves the device, and the profile page offers to turn sync on later.
  const e = await newDevice(browser, cloud)
  await seedGuestProgress(e.page, 'variables', 'seed-e')
  await signIn(e.page, 'ada@example.com')
  await e.page.getByRole('button', { name: 'Not now' }).click()
  await e.page.goto('/#/profile')
  await expect(e.page.getByText('Sync is off for this device')).toBeVisible()
  await e.page.waitForTimeout(1500)
  expect(cloud.rowsFor('ada@example.com', 'attempts').map((r) => r.key)).toEqual(['seed-c'])
  await e.page.reload()
  await expect(e.page.getByRole('dialog')).toHaveCount(0) // and it doesn't ask again every visit
  await e.page.getByRole('button', { name: 'Turn on sync for this device' }).click()
  await expect(e.page.getByRole('dialog', { name: /Combine this device/ })).toBeVisible()
})

test('offline edits wait in the queue and sync when the connection returns; server trouble is reported honestly', async ({ browser }) => {
  const cloud = new FakeSupabase()
  const a = await newDevice(browser, cloud)
  await signUp(a.page, 'ada@example.com')
  await setName(a.page, 'Ada')
  await expect.poll(() => cloud.rowsFor('ada@example.com', 'profile').length, { timeout: 20_000 }).toBe(1)

  await a.context.setOffline(true)
  await setName(a.page, 'Ada (offline)')
  await openAccountMenu(a.page)
  await expect(a.page.locator('header').getByRole('status').filter({ hasText: /Offline/ })).toBeVisible({ timeout: 20_000 })
  await expect(a.page.locator('header').getByRole('status').filter({ hasText: /will sync when you’re back/ })).toBeVisible()
  expect((cloud.rowsFor('ada@example.com', 'profile')[0]!.data as { displayName: string }).displayName).toBe('Ada')

  await a.context.setOffline(false)
  await expect.poll(() => (cloud.rowsFor('ada@example.com', 'profile')[0]!.data as { displayName: string }).displayName, { timeout: 30_000 }).toBe('Ada (offline)')
  await expect(a.page.locator('header').getByRole('status').filter({ hasText: /Synced/ })).toBeVisible({ timeout: 20_000 })

  // The server starts failing: the app says so, keeps the data, and recovers by itself.
  cloud.rejectRest = true
  await setName(a.page, 'Ada (server down)')
  await openAccountMenu(a.page)
  await expect(a.page.locator('header').getByRole('status').filter({ hasText: /having trouble/ })).toBeVisible({ timeout: 20_000 })
  cloud.rejectRest = false
  await a.page.locator('header').getByRole('button', { name: 'Sync now' }).click()
  await expect.poll(() => (cloud.rowsFor('ada@example.com', 'profile')[0]!.data as { displayName: string }).displayName, { timeout: 30_000 }).toBe('Ada (server down)')
})

test('signing out keeps local data; deleting the account erases the cloud copy', async ({ browser }) => {
  const cloud = new FakeSupabase()
  const a = await newDevice(browser, cloud)
  await signUp(a.page, 'ada@example.com')
  await setName(a.page, 'Ada')
  await expect.poll(() => cloud.rowsFor('ada@example.com').length, { timeout: 20_000 }).toBeGreaterThan(0)

  await openAccountMenu(a.page)
  await a.page.locator('header').getByRole('button', { name: 'Sign out' }).click()
  await expect(a.page.locator('header').getByRole('link', { name: 'Sign in' })).toBeVisible()
  await a.page.goto('/#/profile')
  await expect(a.page.getByRole('heading', { level: 1 })).toHaveText('Ada')
  await expect(a.page.getByText('You’re learning as a guest')).toBeVisible()

  await signIn(a.page, 'ada@example.com')
  await a.page.goto('/#/profile')
  await a.page.getByRole('button', { name: 'Delete account…' }).click()
  await a.page.getByRole('dialog').getByRole('button', { name: 'Delete account' }).click()
  await expect.poll(() => cloud.users.length).toBe(0)
  expect(cloud.rows.size).toBe(0)
  await expect(a.page.locator('header').getByRole('link', { name: 'Sign in' })).toBeVisible()
  await expect(a.page.getByRole('heading', { level: 1 })).toHaveText('Ada') // this device keeps its data
})
