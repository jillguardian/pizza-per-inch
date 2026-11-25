import { DEFAULT_THEME } from '@mantine/core'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './lib/contrast'
import { COLOR_TOKENS, type ColorTokenName } from './theme'

type Scheme = 'light' | 'dark'
const SCHEMES: Scheme[] = ['light', 'dark']
const WHITE = '#ffffff'
const TEXT_MIN = 4.5

// Mantine's own surfaces: the page, the cards, and the box drawn around the pizza.
const { colors } = DEFAULT_THEME
const SURFACES = {
  light: { page: WHITE, card: WHITE, pizzaBox: colors.gray[0] },
  dark: { page: colors.dark[7], card: colors.dark[6], pizzaBox: colors.dark[5] },
}
type Surface = keyof typeof SURFACES.light

// Every token must appear in one of these two lists. A new token fails the "no token is left
// unchecked" test until its contrast is declared here.
const TEXT_ON_SURFACES: { token: ColorTokenName; surfaces: Surface[] }[] = [
  { token: 'mutedText', surfaces: ['page', 'card', 'pizzaBox'] },
  { token: 'bestValue', surfaces: ['card'] },
]
const WHITE_TEXT_ON_FILL: ColorTokenName[] = ['primary', 'rank1', 'rank2', 'rank3', 'rankOther']

describe('color tokens', () => {
  describe.each(SCHEMES)('in %s mode', (scheme) => {
    it.each(TEXT_ON_SURFACES)('$token is readable on every surface it sits on', (requirement) => {
      for (const surface of requirement.surfaces) {
        const ratio = contrastRatio(
          COLOR_TOKENS[requirement.token][scheme],
          SURFACES[scheme][surface],
        )
        expect(ratio, `${requirement.token} on ${surface}`).toBeGreaterThanOrEqual(TEXT_MIN)
      }
    })

    it.each(WHITE_TEXT_ON_FILL)('white text is readable on %s', (token) => {
      expect(contrastRatio(WHITE, COLOR_TOKENS[token][scheme])).toBeGreaterThanOrEqual(TEXT_MIN)
    })
  })

  it('has a light and a dark value for every token, as #rrggbb', () => {
    for (const [name, token] of Object.entries(COLOR_TOKENS)) {
      expect(token.light, `${name} light`).toMatch(/^#[0-9a-f]{6}$/i)
      expect(token.dark, `${name} dark`).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('has no token that is left unchecked', () => {
    const checked = new Set<string>([
      ...TEXT_ON_SURFACES.map((requirement) => requirement.token),
      ...WHITE_TEXT_ON_FILL,
    ])
    expect([...Object.keys(COLOR_TOKENS)].filter((name) => !checked.has(name))).toEqual([])
  })

  it('keeps the best rank and the best value highlight the same green in light mode', () => {
    expect(COLOR_TOKENS.rank1.light).toBe(COLOR_TOKENS.bestValue.light)
  })
})

// Colors are chosen in theme.ts only. The pizza drawing is artwork, not interface color, and
// the two Mantine icon buttons below are checked by axe and by eye.
const PALETTES = 'red|pink|grape|violet|indigo|blue|cyan|teal|green|lime|yellow|orange|gray|dark'
const RAW_COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,8}\b/,
  /--mantine-color-[a-z]+-\d/,
  new RegExp(`\\b(?:color|c)=\\{?["'](?:${PALETTES})(?:\\.\\d)?["']`),
  new RegExp(`\\bc=\\{[^}]*["'](?:${PALETTES})["']`),
]
const ALLOWED_IN: Record<string, string[]> = {
  './components/OfferCard.tsx': ['color="red"'],
  './components/OfferVisual.tsx': ['color="gray"'],
}

function rawColorsIn(source: string): string[] {
  return RAW_COLOR_PATTERNS.flatMap((pattern) => source.match(pattern) ?? [])
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

  it('finds a hex value, a palette shade and a palette name when they are there', () => {
    expect(rawColorsIn('fill="#c0392b"')).not.toEqual([])
    expect(rawColorsIn('border-color: var(--mantine-color-green-6);')).not.toEqual([])
    expect(rawColorsIn('<Badge color="orange" />')).not.toEqual([])
    expect(rawColorsIn("<Text c={isBest ? 'green' : 'dimmed'} />")).not.toEqual([])
    expect(rawColorsIn('<Text c="dimmed" /> background: var(--mantine-color-body);')).toEqual([])
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
