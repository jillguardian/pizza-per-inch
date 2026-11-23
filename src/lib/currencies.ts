export interface Currency {
  code: string
  name: string
}

export interface CurrencyGroups {
  common: Currency[]
  other: Currency[]
}

const COMMON_CODES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

const EURO_REGIONS = [
  'AT',
  'BE',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
]

// Browsers expose no locale-to-currency API, so this covers common regions only.
const REGION_CURRENCY: Record<string, string> = {
  ...Object.fromEntries(EURO_REGIONS.map((region) => [region, 'EUR'])),
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  MX: 'MXN',
  BR: 'BRL',
  IN: 'INR',
  CN: 'CNY',
  KR: 'KRW',
  ZA: 'ZAR',
  SG: 'SGD',
  PH: 'PHP',
  TR: 'TRY',
  AE: 'AED',
}

export function detectLocaleCurrency(locale: string = navigator.language): string | null {
  const region = new Intl.Locale(locale).maximize().region
  return (region && REGION_CURRENCY[region]) || null
}

export function listCurrencies(locale?: string): CurrencyGroups {
  const names = new Intl.DisplayNames(locale, { type: 'currency' })
  const all = Intl.supportedValuesOf('currency').map((code) => ({
    code,
    name: names.of(code) ?? code,
  }))

  const localeCurrency = detectLocaleCurrency(locale)
  const pinnedCodes = new Set([localeCurrency, ...COMMON_CODES])
  return {
    common: all
      .filter(({ code }) => pinnedCodes.has(code))
      .sort((a, b) => pinOrder(a.code, localeCurrency) - pinOrder(b.code, localeCurrency)),
    other: all.filter(({ code }) => !pinnedCodes.has(code)),
  }
}

function pinOrder(code: string, localeCurrency: string | null): number {
  if (code === localeCurrency) return -1
  return COMMON_CODES.indexOf(code)
}
