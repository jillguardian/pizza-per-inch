import { describe, expect, it } from 'vitest'
import { detectLocaleCurrency, isSupportedCurrency, listCurrencies } from './currencies'

describe('detectLocaleCurrency', () => {
  it('maps a locale region to its currency', () => {
    expect(detectLocaleCurrency('en-GB')).toBe('GBP')
    expect(detectLocaleCurrency('de-DE')).toBe('EUR')
  })

  it('returns null for regions it does not know', () => {
    expect(detectLocaleCurrency('en-KE')).toBeNull()
  })
})

describe('listCurrencies', () => {
  it('pins the locale currency first, then the common ones', () => {
    const { common } = listCurrencies('ja-JP')
    expect(common.map(({ code }) => code)).toEqual(['JPY', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'])
  })

  it('does not duplicate a locale currency that is already common', () => {
    const { common, other } = listCurrencies('en-US')
    expect(common.map(({ code }) => code)).toEqual(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    expect(other.some(({ code }) => code === 'USD')).toBe(false)
  })

  it('gives readable names', () => {
    expect(listCurrencies('en-US').common[0]).toEqual({ code: 'USD', name: 'US Dollar' })
  })
})

describe('isSupportedCurrency', () => {
  it('knows the currencies the browser can format', () => {
    expect(isSupportedCurrency('USD')).toBe(true)
    expect(isSupportedCurrency('EUR')).toBe(true)
  })

  it('does not know made-up or lowercase codes', () => {
    expect(isSupportedCurrency('XXZ')).toBe(false)
    expect(isSupportedCurrency('usd')).toBe(false)
    expect(isSupportedCurrency('')).toBe(false)
  })
})
