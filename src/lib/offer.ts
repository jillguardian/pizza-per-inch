import { createPizza, pizzaArea, type Pizza, type SizeUnit } from './pizza'

// What is priced and compared: one price for one or more pizzas.
export interface Offer {
  id: number
  name: string
  notes: string
  price: number
  pizzas: Pizza[]
}

export interface OfferRank {
  rank: number
  percentAboveBest: number
}

// Prices per area closer than this (relative) count as a tie, so float noise from unit
// conversion cannot split offers that cost the same.
const TIE_TOLERANCE = 1e-9

// The area of every pizza in the offer, or null while any pizza has no usable size or quantity.
// A partial total would make an offer look cheaper than it is.
export function offerArea(offer: Offer, unit: SizeUnit): number | null {
  if (offer.pizzas.length === 0) return null
  let total = 0
  for (const pizza of offer.pizzas) {
    const area = pizzaArea(pizza, unit)
    if (!(area > 0) || !(pizza.quantity > 0)) return null
    total += area * pizza.quantity
  }
  return total
}

export function pricePerSquareUnit(offer: Offer, unit: SizeUnit): number | null {
  const area = offerArea(offer, unit)
  if (area === null || offer.price <= 0) return null
  return offer.price / area
}

// Ranks comparable offers by price per square inch, so mixed units compare fairly. Ties share
// a rank and the next rank follows without a gap (1, 1, 2). Offers without a size or price get
// no entry, and nothing is ranked until at least two offers can be compared.
export function rankOffers(offers: Offer[]): Map<number, OfferRank> {
  const comparable = offers
    .map((offer) => ({ id: offer.id, price: pricePerSquareUnit(offer, 'in') }))
    .filter((entry): entry is { id: number; price: number } => entry.price !== null)
    .sort((a, b) => a.price - b.price)

  const ranks = new Map<number, OfferRank>()
  if (comparable.length < 2) return ranks

  const bestPrice = comparable[0].price
  let rank = 0
  let previousPrice = -Infinity
  for (const { id, price } of comparable) {
    if (price - previousPrice > previousPrice * TIE_TOLERANCE) rank += 1
    previousPrice = price
    ranks.set(id, { rank, percentAboveBest: (price / bestPrice - 1) * 100 })
  }
  return ranks
}

// Best first. Offers that are not ranked go last, and offers with the same rank keep their order.
export function sortByRank(offers: Offer[]): Offer[] {
  const ranks = rankOffers(offers)
  const position = (offer: Offer): number => ranks.get(offer.id)?.rank ?? Number.MAX_SAFE_INTEGER
  return [...offers].sort((a, b) => position(a) - position(b))
}

export const INITIAL_OFFERS: Offer[] = [
  { id: 1, name: 'Small', notes: '', price: 9, pizzas: [createPizza(1, 10)] },
  { id: 2, name: 'Large', notes: '', price: 18, pizzas: [createPizza(1, 16)] },
]

export function isBundle(offer: Offer): boolean {
  return offer.pizzas.length > 1 || offer.pizzas.some((pizza) => pizza.quantity > 1)
}

export function createOffer(id: number): Offer {
  return { id, name: `Offer ${id}`, notes: '', price: 12, pizzas: [createPizza(1)] }
}
