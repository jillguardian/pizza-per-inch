import { describe, expect, it } from 'vitest'
import { rankColor } from './rankColor'

describe('rankColor', () => {
  it('gives each of the first three ranks its own color', () => {
    const colors = [rankColor(1), rankColor(2), rankColor(3)]
    expect(new Set(colors).size).toBe(3)
  })

  it('names the rank palettes of the theme', () => {
    expect(rankColor(1)).toBe('rank-1')
    expect(rankColor(2)).toBe('rank-2')
    expect(rankColor(3)).toBe('rank-3')
    expect(rankColor(4)).toBe('rank-other')
  })

  it('gives every other rank the same color, different from the podium', () => {
    const podium = [rankColor(1), rankColor(2), rankColor(3)]
    expect(rankColor(4)).toBe(rankColor(10))
    expect(podium).not.toContain(rankColor(4))
  })
})
