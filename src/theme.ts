import { colorsTuple, createTheme, DEFAULT_THEME, type CSSVariablesResolver } from '@mantine/core'

// The colors the app picks, and the only place they are written down. Components and styles use
// the names below (through the theme and the CSS variables), never a hex value or a Mantine
// palette shade. theme.test.ts checks the contrast of each one in light and dark.

interface ColorToken {
  light: string
  dark: string
}

const { colors } = DEFAULT_THEME
const PRIMARY_SHADE = 8
const sameInBoth = (hex: string): ColorToken => ({ light: hex, dark: hex })

export const COLOR_TOKENS = {
  // The main color: filled buttons and checked boxes. White text sits on it.
  primary: sameInBoth(colors.blue[PRIMARY_SHADE]),
  // Dimmed text, including the descriptions Mantine puts under inputs.
  mutedText: { light: '#66707a', dark: '#a8a8a8' },
  // "Best value" text and the border of the best card, against the card.
  bestValue: { light: '#288339', dark: '#51cf66' },
  // Rank tags, with white text on them.
  rank1: sameInBoth('#288339'),
  rank2: sameInBoth(colors.blue[8]),
  rank3: sameInBoth('#c2410c'),
  rankOther: sameInBoth(colors.gray[7]),
} satisfies Record<string, ColorToken>

export type ColorTokenName = keyof typeof COLOR_TOKENS

export const theme = createTheme({
  primaryShade: { light: PRIMARY_SHADE, dark: PRIMARY_SHADE },
  // Filled components take their color from one shade of a palette, so each rank color is a
  // palette of one shade, and rankColor() hands out the palette names.
  colors: {
    'rank-1': colorsTuple(COLOR_TOKENS.rank1.light),
    'rank-2': colorsTuple(COLOR_TOKENS.rank2.light),
    'rank-3': colorsTuple(COLOR_TOKENS.rank3.light),
    'rank-other': colorsTuple(COLOR_TOKENS.rankOther.light),
  },
})

// Turns the tokens into CSS variables that follow the color scheme. --mantine-color-dimmed is
// Mantine's own variable for dimmed text, so overriding it also fixes the input descriptions.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-dimmed': COLOR_TOKENS.mutedText.light,
    '--app-color-best-value': COLOR_TOKENS.bestValue.light,
  },
  dark: {
    '--mantine-color-dimmed': COLOR_TOKENS.mutedText.dark,
    '--app-color-best-value': COLOR_TOKENS.bestValue.dark,
  },
})
