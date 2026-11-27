import { afterEach, describe, expect, it, vi } from 'vitest'
import { INITIAL_OFFERS } from './offer'
import { serializeSaved, type SavedComparison } from './saved'
import { loadSaved, saveComparison } from './savedStorage'

const knownCurrency = (code: string): boolean => code === 'USD'
const comparison: SavedComparison = {
  offers: INITIAL_OFFERS,
  currency: 'USD',
  priceUnit: 'in',
  bundlesChosen: false,
}

describe('savedStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('remembers a comparison from one load to the next', () => {
    saveComparison(comparison)
    expect(loadSaved(knownCurrency)).toEqual(comparison)
  })

  it('has nothing to load before anything is saved', () => {
    expect(loadSaved(knownCurrency)).toBeNull()
  })

  it('replaces the previous comparison when it saves again', () => {
    saveComparison(comparison)
    saveComparison({ ...comparison, priceUnit: 'cm' })
    expect(loadSaved(knownCurrency)?.priceUnit).toBe('cm')
  })

  it('has nothing to load when the stored text is damaged', () => {
    saveComparison(comparison)
    const key = Object.keys(localStorage)[0]
    localStorage.setItem(key, serializeSaved(comparison).slice(0, 20))
    expect(loadSaved(knownCurrency)).toBeNull()
  })

  it('has nothing to load, without an error, when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage is blocked')
    })
    expect(loadSaved(knownCurrency)).toBeNull()
  })

  it('carries on, without an error, when storage cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage is full')
    })
    expect(() => saveComparison(comparison)).not.toThrow()
  })
})
