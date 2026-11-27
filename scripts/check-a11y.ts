import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { chromium, type Browser, type Page } from 'playwright-core'
import { preview } from 'vite'

// Runs axe in real Chrome against the production build, at three widths, in light and dark mode,
// with the example offers and with a busy page (bundle controls on, four ranked offers, sorted).
// Real Chrome is used because color contrast cannot be measured in jsdom. Fails on any violation,
// on an error thrown by the page, and on a run that could not finish. Prints axe's "incomplete"
// results as notes, because those need a human look. One more run asks Chrome for reduced motion
// and fails if anything still has a transition or animation. A last run checks that focusing a
// pinned control does not scroll the page. Run it with `npm run a11y`.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const WIDTHS = [375, 768, 1280]
const SCHEMES = ['light', 'dark'] as const
const STATES = ['example offers', 'busy page'] as const
const PRICES = ['9', '18', '12', '30']

// Mantine fades some colors over 0.1 s. Switching that off means axe never measures a color
// half way through a fade.
const NO_MOTION =
  '*, *::before, *::after { transition: none !important; animation: none !important; }'

type Scheme = (typeof SCHEMES)[number]
type State = (typeof STATES)[number]

interface Violation {
  id: string
  impact: string | null
  help: string
  helpUrl: string
  nodes: { target: string[] }[]
}

interface AxeResult {
  violations: Violation[]
  incomplete: { id: string; nodes: unknown[] }[]
}

interface Scan {
  failures: string[]
  notes: string[]
}

// Lists the elements (and their ::before and ::after) that still have a transition or an
// animation. Written as a string, because this file is not type-checked against the DOM.
const FIND_MOTION = `(() => {
  const moves = (cs) => [cs.transitionDuration, cs.animationDuration].some((v) => v.split(',').some((x) => parseFloat(x) > 0))
  const found = new Set()
  for (const el of document.querySelectorAll('*')) {
    for (const pseudo of [null, '::before', '::after']) {
      if (moves(getComputedStyle(el, pseudo))) found.add(el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 2).join('.') + (pseudo ?? ''))
    }
  }
  return [...found]
})()`

function write(text: string): void {
  process.stdout.write(`${text}\n`)
}

// The busy page shows every rank color, the bundle controls and the locked checkbox note, and
// has a status message in the live region.
async function makeBusy(page: Page): Promise<void> {
  await page.getByRole('checkbox', { name: 'Multi-pizza deals' }).check()
  await page.getByRole('button', { name: 'Add pizza' }).first().click()
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Add offer' }).click()
  const prices = page.getByRole('textbox', { name: /Price/ })
  const found = await prices.count()
  if (found !== PRICES.length) {
    throw new Error(`The busy page needs ${PRICES.length} price fields, but the page has ${found}.`)
  }
  for (const [index, price] of PRICES.entries()) await prices.nth(index).fill(price)
  await page.getByRole('button', { name: 'Sort by value' }).click()
  await page.evaluate('document.activeElement?.blur(); window.scrollTo(0, 0)')
}

async function scan(
  browser: Browser,
  axeSource: string,
  url: string,
  colorScheme: Scheme,
  width: number,
  state: State,
): Promise<Scan> {
  const where = `${colorScheme}, ${width}px, ${state}`
  const context = await browser.newContext({ colorScheme, viewport: { width, height: 900 } })
  try {
    const page = await context.newPage()
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(url)
    await page.waitForSelector('h1')
    await page.addStyleTag({ content: NO_MOTION })
    if (state === 'busy page') await makeBusy(page)
    await page.mouse.move(0, 0)
    await page.addScriptTag({ content: axeSource })
    const options = JSON.stringify({ runOnly: { type: 'tag', values: AXE_TAGS } })
    const result = (await page.evaluate(`axe.run(document, ${options})`)) as AxeResult

    const violations = result.violations.map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' ')).slice(0, 3)
      return (
        `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n` +
        `    ${where}\n    ${targets.join('\n    ')}\n    ${violation.helpUrl}`
      )
    })
    return {
      failures: [
        ...pageErrors.map((message) => `[page error] ${where}\n    ${message}`),
        ...violations,
      ],
      notes: result.incomplete.map(
        (item) => `${item.id} on ${item.nodes.length} element(s) needs a human look (${where})`,
      ),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
    return { failures: [`[run failed] ${where}\n    ${message}`], notes: [] }
  } finally {
    await context.close()
  }
}

// With reduced motion asked for, nothing may move. Runs on the busy page, after every control has
// been used once, and without the NO_MOTION style the axe scans add.
async function scanReducedMotion(browser: Browser, url: string): Promise<Scan> {
  const where = 'reduced motion, 1280px, busy page'
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 900 },
  })
  try {
    const page = await context.newPage()
    await page.goto(url)
    await page.waitForSelector('h1')
    await makeBusy(page)
    const moving = (await page.evaluate(FIND_MOTION)) as string[]
    const list = moving.slice(0, 8).join('\n    ')
    return {
      failures: moving.length
        ? [`[motion] ${where}: ${moving.length} kind(s) of element still move\n    ${list}`]
        : [],
      notes: [],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
    return { failures: [`[run failed] ${where}\n    ${message}`], notes: [] }
  } finally {
    await context.close()
  }
}

// The controls that are pinned at the top of the screen, by width. The selectors name the pinned
// containers, so a second link or button elsewhere on the page cannot match. The theme toggle and
// the GitHub link are pinned from 768px.
const PINNED_BUTTONS = [
  '.toolbar-actions button:has-text("Add offer")',
  '.toolbar-actions button[aria-label="Sort by value"]',
]
const PINNED_CONTROLS = [
  // On a phone Reset is among the pinned buttons. From 768px it is in the settings row.
  { width: 375, controls: [...PINNED_BUTTONS, '.toolbar-actions button[aria-label="Reset"]'] },
  {
    width: 768,
    controls: [
      ...PINNED_BUTTONS,
      ...[0, 1, 2].map((index) => `.page-actions input[type=radio] >> nth=${index}`),
      '.page-actions a[href*="github.com"]',
    ],
  },
]

// The pinned controls stay at the top of the screen, so focusing one (a click, or Tab onto a
// button) must not move the page. Runs with the page scrolled down, at each width where the
// control is pinned. Smooth scrolling is switched off, so the page has stopped moving by the time
// it is measured.
async function scanFocusScroll(browser: Browser, url: string): Promise<Scan> {
  const failures: string[] = []
  for (const { width, controls } of PINNED_CONTROLS) {
    const where = `focus scroll, ${width}px, busy page`
    const context = await browser.newContext({ viewport: { width, height: 700 } })
    try {
      const page = await context.newPage()
      await page.goto(url)
      await page.waitForSelector('h1')
      await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
      await makeBusy(page)
      for (const control of controls) {
        await page.evaluate('document.activeElement?.blur(); window.scrollTo(0, 800)')
        const before = (await page.evaluate('window.scrollY')) as number
        if (before < 300) throw new Error(`The page is too short to scroll (${before}px).`)
        await page.locator(control).focus()
        const after = (await page.evaluate('window.scrollY')) as number
        if (Math.abs(after - before) > 1) {
          failures.push(
            `[focus scroll] ${where}: focusing ${control} moved the page from ${before}px to ${after}px`,
          )
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
      failures.push(`[run failed] ${where}\n    ${message}`)
    } finally {
      await context.close()
    }
  }
  return { failures, notes: [] }
}

async function main(): Promise<void> {
  const axeSource = await readFile(
    createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
    'utf8',
  )
  const server = await preview({ preview: { host: '127.0.0.1', open: false } })
  const url = server.resolvedUrls?.local[0]
  if (!url) throw new Error('The preview server did not start. Run `npm run build` first.')
  const browser = await chromium.launch({ channel: 'chrome' })
  const failures: string[] = []
  const notes: string[] = []
  let runs = 0

  try {
    for (const colorScheme of SCHEMES) {
      for (const width of WIDTHS) {
        for (const state of STATES) {
          const result = await scan(browser, axeSource, url, colorScheme, width, state)
          failures.push(...result.failures)
          notes.push(...result.notes)
          runs += 1
        }
      }
    }
    const motion = await scanReducedMotion(browser, url)
    failures.push(...motion.failures)
    runs += 1
    const focus = await scanFocusScroll(browser, url)
    failures.push(...focus.failures)
    runs += PINNED_CONTROLS.length
  } finally {
    await browser.close()
    await server.close()
  }

  if (notes.length > 0) write(`Not failures, but worth a look:\n  ${notes.join('\n  ')}\n`)
  if (failures.length > 0) {
    write(`Found ${failures.length} problem(s) in ${runs} runs:\n`)
    for (const failure of failures) write(`${failure}\n`)
    process.exitCode = 1
    return
  }
  write(
    `No problems in ${runs} runs: axe at ${WIDTHS.join(', ')} px in light and dark, nothing moves with reduced motion, and focusing a pinned control does not scroll the page.`,
  )
}

await main()
