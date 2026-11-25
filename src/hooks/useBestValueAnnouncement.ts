import { useEffect, useRef } from 'react'
import { bestValue } from '../lib/announcements'
import type { Offer, OfferRank } from '../lib/offer'

const PAUSE_MS = 1000

// Prices change on every keystroke, so a change of best value is announced only after typing
// pauses, and not at all when the page first loads.
export function useBestValueAnnouncement(
  offers: Offer[],
  ranks: Map<number, OfferRank>,
  announce: (text: string) => void,
): void {
  const best = offers.filter((offer) => ranks.get(offer.id)?.rank === 1)
  const key = best.map((offer) => offer.id).join(',')
  const announced = useRef(key)

  useEffect(() => {
    if (key === announced.current) return
    const timer = setTimeout(() => {
      announced.current = key
      if (best.length > 0) announce(bestValue(best.map((offer) => offer.name)))
    }, PAUSE_MS)
    return (): void => clearTimeout(timer)
  }, [key, best, announce])
}
