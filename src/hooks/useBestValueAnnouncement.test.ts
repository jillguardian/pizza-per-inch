import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createOffer, type Offer, type OfferRank } from '../lib/offer'
import { useBestValueAnnouncement } from './useBestValueAnnouncement'

const offers = (): Offer[] => [
  { ...createOffer(1), name: 'Small' },
  { ...createOffer(2), name: 'Large' },
]
const bestIs = (id: number): Map<number, OfferRank> =>
  new Map([
    [id, { rank: 1, percentAboveBest: 0 }],
    [id === 1 ? 2 : 1, { rank: 2, percentAboveBest: 10 }],
  ])

describe('useBestValueAnnouncement', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function setup(): {
    announce: ReturnType<typeof vi.fn>
    rerender: (best: number) => void
  } {
    const announce = vi.fn()
    const { rerender } = renderHook(
      ({ best }) => useBestValueAnnouncement(offers(), bestIs(best), announce),
      { initialProps: { best: 1 } },
    )
    return { announce, rerender: (best) => rerender({ best }) }
  }

  it('says nothing when the page first loads', () => {
    const { announce } = setup()
    vi.advanceTimersByTime(5000)
    expect(announce).not.toHaveBeenCalled()
  })

  it('announces a new best value after a pause, not straight away', () => {
    const { announce, rerender } = setup()

    rerender(2)
    vi.advanceTimersByTime(900)
    expect(announce).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(announce).toHaveBeenCalledExactlyOnceWith('Large is now the best value.')
  })

  it('is not delayed again by renders that do not change the best value', () => {
    const { announce, rerender } = setup()

    rerender(2)
    vi.advanceTimersByTime(600)
    rerender(2)
    vi.advanceTimersByTime(500)

    expect(announce).toHaveBeenCalledExactlyOnceWith('Large is now the best value.')
  })

  it('says nothing when the best value changes and then changes back before the pause ends', () => {
    const { announce, rerender } = setup()

    rerender(2)
    vi.advanceTimersByTime(500)
    rerender(1)
    vi.advanceTimersByTime(2000)

    expect(announce).not.toHaveBeenCalled()
  })
})
