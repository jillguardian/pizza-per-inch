import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { chromium, type Page } from 'playwright-core'
import { preview } from 'vite'

// Runs axe in real Chrome against the production build, at three widths, in light and dark mode,
// with the example offers and with a busy page (bundle controls on, four ranked offers, sorted).
// Real Chrome is used because color contrast cannot be measured in jsdom. Fails on any violation.
// Run it with `npm run a11y`.

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const WIDTHS = [375, 768, 1280]
const SCHEMES = ['light', 'dark'] as const
const STATES = ['example offers', 'busy page'] as const
const PRICES = ['9', '18', '12', '30']

interface Violation {
  id: string
  impact: string | null
  help: string
  helpUrl: string
  nodes: { target: string[]; failureSummary?: string }[]
}

function write(text: string): void {
  process.stdout.write(`${text}\n`)
}

// The busy page shows every rank color, the bundle controls and the locked checkbox note, and
// has a status message in the live region.
async function makeBusy(page: Page): Promise<void> {
  await page.getByRole('checkbox', { name: 'Multi-pizza deals' }).check()
  await page.getByRole('button', { name: 'Add pizza' }).first().click()
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '+ Add offer' }).click()
  const prices = page.getByRole('textbox', { name: /Price/ })
  for (const [index, price] of PRICES.entries()) await prices.nth(index).fill(price)
  await page.getByRole('button', { name: 'Sort by value' }).click()
  await page.evaluate('document.activeElement?.blur(); window.scrollTo(0, 0)')
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
  let runs = 0

  try {
    for (const colorScheme of SCHEMES) {
      for (const width of WIDTHS) {
        for (const state of STATES) {
          const context = await browser.newContext({
            colorScheme,
            viewport: { width, height: 900 },
          })
          const page = await context.newPage()
          await page.goto(url)
          await page.waitForSelector('h1')
          if (state === 'busy page') await makeBusy(page)
          await page.addScriptTag({ content: axeSource })
          const options = JSON.stringify({ runOnly: { type: 'tag', values: AXE_TAGS } })
          const result = (await page.evaluate(`axe.run(document, ${options})`)) as {
            violations: Violation[]
          }
          runs += 1
          for (const violation of result.violations) {
            const where = `${colorScheme}, ${width}px, ${state}`
            const targets = violation.nodes.map((node) => node.target.join(' ')).slice(0, 3)
            failures.push(
              `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n` +
                `    ${where}\n    ${targets.join('\n    ')}\n    ${violation.helpUrl}`,
            )
          }
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }

  if (failures.length > 0) {
    write(`axe found ${failures.length} violation(s) in ${runs} runs:\n`)
    for (const failure of failures) write(`${failure}\n`)
    process.exitCode = 1
    return
  }
  write(`axe found no violations in ${runs} runs (${WIDTHS.join(', ')} px, light and dark).`)
}

await main()
