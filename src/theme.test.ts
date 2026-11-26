import { DEFAULT_THEME } from '@mantine/core'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './lib/contrast'
import { FILL_TOKENS, TEXT_TOKENS, theme, type FillTokenName, type TextTokenName } from './theme'

type Scheme = 'light' | 'dark'
const SCHEMES: Scheme[] = ['light', 'dark']
const WHITE = '#ffffff'
const TEXT_MIN = 4.5
const HEX = /^#[0-9a-f]{6}$/i

// The surfaces text sits on, as the components draw them:
//   page      --mantine-color-body
//   card      the background of Mantine's Card
//   pizzaBox  --mantine-color-default-hover, used by .pizza-box in OfferCard.css
// This table does not follow a change of background by itself. The axe check in real Chrome,
// planned in the accessibility issue, is the backstop for a drift.
const { colors } = DEFAULT_THEME
const SURFACES = {
  light: { page: WHITE, card: WHITE, pizzaBox: colors.gray[0] },
  dark: { page: colors.dark[7], card: colors.dark[6], pizzaBox: colors.dark[5] },
}
type Surface = keyof typeof SURFACES.light

// Every token must appear here. A new token fails the "left unchecked" test until its contrast
// is declared.
const TEXT_ON_SURFACES: { token: TextTokenName; surfaces: Surface[] }[] = [
  { token: 'mutedText', surfaces: ['page', 'card', 'pizzaBox'] },
  { token: 'bestValue', surfaces: ['card'] },
]
const WHITE_TEXT_ON_FILL = Object.keys(FILL_TOKENS) as FillTokenName[]

describe('color tokens', () => {
  describe.each(SCHEMES)('text in %s mode', (scheme) => {
    it.each(TEXT_ON_SURFACES)('$token is readable on every surface it sits on', (requirement) => {
      for (const surface of requirement.surfaces) {
        const ratio = contrastRatio(
          TEXT_TOKENS[requirement.token][scheme],
          SURFACES[scheme][surface],
        )
        expect(ratio, `${requirement.token} on ${surface}`).toBeGreaterThanOrEqual(TEXT_MIN)
      }
    })
  })

  it.each(WHITE_TEXT_ON_FILL)('white text is readable on the %s fill', (token) => {
    expect(contrastRatio(WHITE, FILL_TOKENS[token])).toBeGreaterThanOrEqual(TEXT_MIN)
  })

  it('writes every color as #rrggbb, text colors for light and for dark', () => {
    for (const [name, token] of Object.entries(TEXT_TOKENS)) {
      expect(token.light, `${name} light`).toMatch(HEX)
      expect(token.dark, `${name} dark`).toMatch(HEX)
    }
    for (const [name, color] of Object.entries(FILL_TOKENS)) expect(color, name).toMatch(HEX)
  })

  it('has no text token that is left unchecked', () => {
    const checked = new Set<string>(TEXT_ON_SURFACES.map((requirement) => requirement.token))
    expect(Object.keys(TEXT_TOKENS).filter((name) => !checked.has(name))).toEqual([])
  })

  it('keeps the best rank and the best value highlight the same green in light mode', () => {
    expect(FILL_TOKENS.rank1).toBe(TEXT_TOKENS.bestValue.light)
  })
})

// Colors are chosen in theme.ts only. The pizza drawing is artwork, not interface color, and
// the two Mantine icon buttons below are checked by axe and by eye. Named CSS colors written in
// a stylesheet (`color: green`) are not covered.
const PALETTES = 'red|pink|grape|violet|indigo|blue|cyan|teal|green|lime|yellow|orange|gray|dark'
const COLOR_PROPS = 'color|c|bg|bgc|borderColor|bdc'
const RAW_COLOR_PATTERNS = [
  // A hex value, but not a CSS id selector such as #add-offer, which can start with hex letters.
  /(?<![\w&#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g,
  /--mantine-color-[a-z]+-\d/g,
  new RegExp(`\\b(?:${COLOR_PROPS})=\\{?["'](?:${PALETTES})(?:\\.\\d)?["']`, 'g'),
  new RegExp(`\\b(?:${COLOR_PROPS})=\\{[^}]*["'](?:${PALETTES})["']`, 'g'),
  /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/g,
  /\bstyle=\{\{[^}]*\b(?:color|background(?:Color)?|borderColor)\s*:\s*["'](?!var\()[^"']+["']/g,
]
const ALLOWED_IN: Record<string, string[]> = {
  './components/OfferCard.tsx': ['color="red"'],
  './components/OfferVisual.tsx': ['color="gray"'],
}

function rawColorsIn(source: string): string[] {
  return RAW_COLOR_PATTERNS.flatMap((pattern) => [...source.matchAll(pattern)].map((m) => m[0]))
}

describe('raw colors', () => {
  const sources = import.meta.glob(
    [
      './**/*.{ts,tsx,css}',
      '!./**/*.test.*',
      '!./theme.ts',
      '!./test/**',
      '!./components/PizzaVisual.tsx',
    ],
    { query: '?raw', import: 'default', eager: true },
  ) as Record<string, string>

  it.each([
    ['a hex value', 'fill="#c0392b"'],
    ['a short hex value', 'color: #fff;'],
    ['a palette shade variable', 'border-color: var(--mantine-color-green-6);'],
    ['a palette name', '<Badge color="orange" />'],
    ['a palette name in an expression', "<Text c={isBest ? 'green' : 'dimmed'} />"],
    ['a background prop', '<Box bg="green.6" />'],
    ['an rgb() color', 'border: 1px solid rgb(0,128,0);'],
    ['an hsl() color', 'color: hsl(120 50% 40%);'],
    ['a style color', "<Text style={{ color: 'green' }} />"],
  ])('finds %s', (_name, source) => {
    expect(rawColorsIn(source)).not.toEqual([])
  })

  it.each([
    [
      'dimmed text and a semantic Mantine variable',
      '<Text c="dimmed" /> background: var(--mantine-color-body);',
    ],
    [
      'a CSS id selector that starts with hex letters',
      '#add-offer { margin: 0 } #bad-input { margin: 0 }',
    ],
    ['a style without a color', '<Text style={{ flex: 1 }} />'],
    ['a style color from a variable', "<Box style={{ color: 'var(--app-color-best-value)' }} />"],
  ])('does not flag %s', (_name, source) => {
    expect(rawColorsIn(source)).toEqual([])
  })

  it('lists every raw color in a file, not only the first', () => {
    expect(rawColorsIn('<A color="red" /> <B color="blue" />')).toHaveLength(2)
  })

  it('checks the app files', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(10)
  })

  it('has none outside theme.ts', () => {
    const offenders = Object.entries(sources).flatMap(([file, source]) => {
      const allowed = ALLOWED_IN[file] ?? []
      const cleaned = allowed.reduce((text, snippet) => text.replaceAll(snippet, ''), source)
      return rawColorsIn(cleaned).map((match) => `${file}: ${match}`)
    })
    expect(offenders).toEqual([])
  })
})

describe('cursor', () => {
  it('shows the hand over buttons and other controls, which Mantine leaves as an arrow by default', () => {
    expect(theme.cursorType).toBe('pointer')
  })
})
