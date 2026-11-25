import { colorsTuple, createTheme, DEFAULT_THEME, type CSSVariablesResolver } from '@mantine/core'

// The colors the app picks, and the only place they are written down. Components and styles use
// the names below (through the theme and the CSS variables), never a hex value or a Mantine
// palette shade. theme.test.ts checks the contrast of each one in light and dark.

interface SchemeColor {
  light: string
  dark: string
}

const { colors } = DEFAULT_THEME
const PRIMARY_SHADE = 8

// Text colors change with the color scheme, so each has a light and a dark value.
export const TEXT_TOKENS = {
  // Dimmed text, including the descriptions Mantine puts under inputs.
  mutedText: { light: '#66707a', dark: '#a8a8a8' },
  // "Best value" text and the border of the best card, against the card.
  bestValue: { light: '#288339', dark: '#51cf66' },
} satisfies Record<string, SchemeColor>

// Fills are one color in both schemes, with white text on them: a filled component takes its
// color from one shade of a palette. A fill that needed a different dark color would be a
// virtual color, and would be a new kind of token.
export const FILL_TOKENS = {
  // The main color: the filled button and checked boxes.
  primary: colors.blue[PRIMARY_SHADE],
  // Rank tags.
  rank1: '#288339',
  rank2: colors.blue[8],
  rank3: '#c2410c',
  rankOther: colors.gray[7],
} satisfies Record<string, string>

export type TextTokenName = keyof typeof TEXT_TOKENS
export type FillTokenName = keyof typeof FILL_TOKENS

export const theme = createTheme({
  primaryShade: { light: PRIMARY_SHADE, dark: PRIMARY_SHADE },
  // Each rank color is a palette of one shade, and rankColor() hands out the palette names.
  colors: {
    'rank-1': colorsTuple(FILL_TOKENS.rank1),
    'rank-2': colorsTuple(FILL_TOKENS.rank2),
    'rank-3': colorsTuple(FILL_TOKENS.rank3),
    'rank-other': colorsTuple(FILL_TOKENS.rankOther),
  },
})

// Turns the text tokens into CSS variables that follow the color scheme. --mantine-color-dimmed
// is Mantine's own variable for dimmed text, so overriding it also fixes the input descriptions.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-dimmed': TEXT_TOKENS.mutedText.light,
    '--app-color-best-value': TEXT_TOKENS.bestValue.light,
  },
  dark: {
    '--mantine-color-dimmed': TEXT_TOKENS.mutedText.dark,
    '--app-color-best-value': TEXT_TOKENS.bestValue.dark,
  },
})
