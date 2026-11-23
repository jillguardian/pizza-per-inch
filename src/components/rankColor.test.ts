import { describe, expect, it } from 'vitest'
import { rankColor } from './rankColor'

describe('rankColor', () => {
  it('gives each of the first three ranks its own color', () => {
    const colors = [rankColor(1), rankColor(2), rankColor(3)]
    expect(new Set(colors).size).toBe(3)
  })

  it('keeps the best rank green, to match the best value highlight', () => {
    expect(rankColor(1)).toBe('green')
  })

  it('gives every other rank the same color, different from the podium', () => {
    const podium = [rankColor(1), rankColor(2), rankColor(3)]
    expect(rankColor(4)).toBe(rankColor(10))
    expect(podium).not.toContain(rankColor(4))
  })
})
