import { describe, expect, it } from 'vitest'
import {
  createOffer,
  INITIAL_OFFERS,
  offerArea,
  pricePerSquareUnit,
  rankOffers,
  type Offer,
} from './offer'
import { createPizza, pizzaArea, type Pizza, type SizeUnit } from './pizza'

const round = (diameter: number, unit: SizeUnit = 'in', quantity = 1): Pizza => ({
  ...createPizza(1, diameter),
  unit,
  quantity,
})

const sheet = (width: number, length: number, unit: SizeUnit = 'in'): Pizza => ({
  ...createPizza(1),
  shape: 'rectangular',
  width,
  length,
  unit,
})

const offer = (id: number, price: number, ...pizzas: Pizza[]): Offer => ({
  id,
  name: `Offer ${id}`,
  notes: '',
  price,
  pizzas,
})

describe('offerArea', () => {
  it('is the area of a single pizza', () => {
    expect(offerArea(offer(1, 10, round(10)), 'in')).toBeCloseTo(Math.PI * 25)
  })

  it('multiplies a pizza area by its quantity', () => {
    expect(offerArea(offer(1, 20, round(10, 'in', 2)), 'in')).toBeCloseTo(2 * Math.PI * 25)
  })

  it('adds pizzas of different sizes, units and shapes', () => {
    const total = offerArea(offer(1, 25, round(16), round(30.48, 'cm'), sheet(10, 10)), 'in')
    expect(total).toBeCloseTo(Math.PI * 64 + Math.PI * 36 + 100)
  })

  it('is null while any pizza has no size, so a partial total never looks cheap', () => {
    expect(offerArea(offer(1, 25, round(16), round(0)), 'in')).toBeNull()
    expect(offerArea(offer(1, 25, round(16), sheet(12, 0)), 'in')).toBeNull()
  })

  it('is null for NaN sizes and quantities instead of a NaN total', () => {
    expect(offerArea(offer(1, 25, round(Number.NaN)), 'in')).toBeNull()
    expect(offerArea(offer(1, 25, round(16, 'in', Number.NaN)), 'in')).toBeNull()
  })

  it('is null for a quantity of zero or an offer without pizzas', () => {
    expect(offerArea(offer(1, 25, round(16, 'in', 0)), 'in')).toBeNull()
    expect(offerArea(offer(1, 25), 'in')).toBeNull()
  })
})

describe('pricePerSquareUnit', () => {
  it('divides the price by the round pizza area', () => {
    expect(pricePerSquareUnit(offer(1, 10, round(10)), 'in')).toBeCloseTo(10 / (Math.PI * 25))
  })

  it('converts to the requested unit', () => {
    const radiusCm = (10 * 2.54) / 2
    expect(pricePerSquareUnit(offer(1, 10, round(10)), 'cm')).toBeCloseTo(
      10 / (Math.PI * radiusCm ** 2),
    )
  })

  it('divides the price by the rectangle area', () => {
    expect(pricePerSquareUnit(offer(1, 19.2, sheet(12, 16)), 'in')).toBeCloseTo(0.1)
  })

  it('divides one price by the total area of every pizza', () => {
    const combo = offer(1, 25, round(16), round(12))
    const total = pizzaArea(round(16), 'in') + pizzaArea(round(12), 'in')
    expect(pricePerSquareUnit(combo, 'in')).toBeCloseTo(25 / total)
  })

  it('treats a quantity of two like two identical pizzas', () => {
    const quantity = offer(1, 20, round(10, 'in', 2))
    const repeated = offer(1, 20, round(10), { ...round(10), id: 2 })
    expect(pricePerSquareUnit(quantity, 'in')).toBeCloseTo(pricePerSquareUnit(repeated, 'in') ?? 0)
  })

  it('returns null when size or price is missing', () => {
    expect(pricePerSquareUnit(offer(1, 10, round(0)), 'in')).toBeNull()
    expect(pricePerSquareUnit(offer(1, 0, round(10)), 'in')).toBeNull()
  })
})

describe('rankOffers', () => {
  it('ranks the bigger pizza first when it costs less per square inch', () => {
    const ranks = rankOffers([offer(1, 10, round(10)), offer(2, 18, round(16))])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('reports how much more each offer costs per area than the best', () => {
    const ranks = rankOffers([offer(1, 10, round(10)), offer(2, 18, round(16))])
    expect(ranks.get(2)?.percentAboveBest).toBe(0)
    expect(ranks.get(1)?.percentAboveBest).toBeCloseTo((10 / 25 / (18 / 64) - 1) * 100)
  })

  it('compares pizzas sized in different units', () => {
    const ranks = rankOffers([offer(1, 12, round(12)), offer(2, 10, round(30, 'cm'))])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('gives tied offers the same rank and keeps the next rank consecutive', () => {
    const ranks = rankOffers([
      offer(1, 10, round(10)),
      offer(2, 10, round(10)),
      offer(3, 20, round(10)),
    ])
    expect(ranks.get(1)?.rank).toBe(1)
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(3)?.rank).toBe(2)
  })

  it('ties the same pizza measured in inches and centimeters', () => {
    const ranks = rankOffers([offer(1, 10, round(10)), offer(2, 10, round(25.4, 'cm'))])
    expect(ranks.get(1)?.rank).toBe(1)
    expect(ranks.get(2)?.rank).toBe(1)
  })

  it('ranks round and rectangular pizzas together', () => {
    const ranks = rankOffers([offer(1, 15, round(14)), offer(2, 15, sheet(18, 13))])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('ranks a multi-pizza offer against single pizzas', () => {
    const single = offer(1, 18, round(16))
    const combo = offer(2, 25, round(16), round(12))
    const ranks = rankOffers([single, combo])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('leaves incomplete offers unranked without affecting the others', () => {
    const ranks = rankOffers([
      offer(1, 10, round(0)),
      offer(2, 12, round(12)),
      offer(3, 18, round(16)),
    ])
    expect(ranks.has(1)).toBe(false)
    expect(ranks.size).toBe(2)
  })

  it('ranks nothing until two offers can be compared', () => {
    expect(rankOffers([offer(1, 12, round(12))]).size).toBe(0)
    expect(rankOffers([offer(1, 12, round(12)), offer(2, 0, round(0))]).size).toBe(0)
  })
})

describe('createOffer', () => {
  it('names the offer after its id and starts with one usable pizza and a price', () => {
    const created = createOffer(7)
    expect(created.id).toBe(7)
    expect(created.name).toBe('Offer 7')
    expect(created.pizzas).toHaveLength(1)
    expect(pricePerSquareUnit(created, 'in')).not.toBeNull()
  })
})

describe('INITIAL_OFFERS', () => {
  it('are two comparable single-pizza offers', () => {
    expect(INITIAL_OFFERS).toHaveLength(2)
    expect(rankOffers(INITIAL_OFFERS).size).toBe(2)
  })
})
