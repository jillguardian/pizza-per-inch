import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('is 21 for black on white, whichever way round', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })

  it('is 1 for a color against itself', () => {
    expect(contrastRatio('#66707a', '#66707a')).toBe(1)
  })

  it('matches published values for real colors', () => {
    expect(contrastRatio('#868e96', '#ffffff')).toBeCloseTo(3.32, 2)
    expect(contrastRatio('#ffffff', '#1971c2')).toBeCloseTo(5.02, 2)
  })
})
