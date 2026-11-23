import { describe, expect, it } from 'vitest'
import {
  createPizza,
  outline,
  pizzaArea,
  pricePerSquareUnit,
  rankPizzas,
  type Pizza,
  type SizeUnit,
} from './pizza'

const pizza = (id: number, diameter: number, price: number, unit: SizeUnit = 'in'): Pizza => ({
  id,
  name: `Pizza ${id}`,
  notes: '',
  shape: 'round',
  diameter,
  width: 12,
  length: 16,
  unit,
  price,
})

const rectangle = (
  id: number,
  width: number,
  length: number,
  price: number,
  unit: SizeUnit = 'in',
): Pizza => ({ ...pizza(id, 0, price, unit), shape: 'rectangular', width, length })

describe('pricePerSquareUnit', () => {
  it('divides price by the round pizza area', () => {
    expect(pricePerSquareUnit(pizza(1, 10, 10), 'in')).toBeCloseTo(10 / (Math.PI * 25))
  })

  it('converts the size to the requested unit', () => {
    const radiusCm = (10 * 2.54) / 2
    expect(pricePerSquareUnit(pizza(1, 10, 10), 'cm')).toBeCloseTo(10 / (Math.PI * radiusCm ** 2))
  })

  it('returns null when size or price is missing', () => {
    expect(pricePerSquareUnit(pizza(1, 0, 10), 'in')).toBeNull()
    expect(pricePerSquareUnit(pizza(1, 10, 0), 'in')).toBeNull()
    expect(pricePerSquareUnit(rectangle(1, 0, 16, 10), 'in')).toBeNull()
    expect(pricePerSquareUnit(rectangle(1, 12, 0, 10), 'in')).toBeNull()
  })

  it('divides price by the rectangle area', () => {
    expect(pricePerSquareUnit(rectangle(1, 12, 16, 19.2), 'in')).toBeCloseTo(0.1)
  })
})

describe('pizzaArea', () => {
  it('uses the circle area for a round pizza, ignoring width and length', () => {
    expect(pizzaArea(pizza(1, 10, 10), 'in')).toBeCloseTo(Math.PI * 25)
  })

  it('multiplies width by length for a rectangular pizza, ignoring the diameter', () => {
    const sheet = { ...rectangle(1, 12, 16, 10), diameter: 99 }
    expect(pizzaArea(sheet, 'in')).toBe(192)
  })

  it('treats a square as a rectangle with equal sides', () => {
    expect(pizzaArea(rectangle(1, 10, 10, 10), 'in')).toBe(100)
  })

  it('converts a rectangle measured in centimeters', () => {
    expect(pizzaArea(rectangle(1, 25.4, 50.8, 10, 'cm'), 'in')).toBeCloseTo(200)
  })
})

describe('outline', () => {
  it('is a square as wide as the diameter for a round pizza', () => {
    expect(outline(pizza(1, 10, 10), 'in')).toEqual({ width: 10, length: 10 })
  })

  it('is the width and length for a rectangular pizza, in the requested unit', () => {
    const { width, length } = outline(rectangle(1, 10, 20, 10), 'cm')
    expect(width).toBeCloseTo(25.4)
    expect(length).toBeCloseTo(50.8)
  })
})

describe('rankPizzas', () => {
  it('ranks the bigger pizza first when it costs less per square inch', () => {
    const ranks = rankPizzas([pizza(1, 10, 10), pizza(2, 16, 18)])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('reports how much more each pizza costs per area than the best', () => {
    const ranks = rankPizzas([pizza(1, 10, 10), pizza(2, 16, 18)])
    expect(ranks.get(2)?.percentAboveBest).toBe(0)
    expect(ranks.get(1)?.percentAboveBest).toBeCloseTo((10 / 25 / (18 / 64) - 1) * 100)
  })

  it('compares pizzas sized in different units', () => {
    const ranks = rankPizzas([pizza(1, 12, 12), pizza(2, 30, 10, 'cm')])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('gives tied pizzas the same rank and keeps the next rank consecutive', () => {
    const ranks = rankPizzas([pizza(1, 10, 10), pizza(2, 10, 10), pizza(3, 10, 20)])
    expect(ranks.get(1)?.rank).toBe(1)
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(3)?.rank).toBe(2)
  })

  it('ties the same pizza measured in inches and centimeters', () => {
    const ranks = rankPizzas([pizza(1, 10, 10), pizza(2, 25.4, 10, 'cm')])
    expect(ranks.get(1)?.rank).toBe(1)
    expect(ranks.get(2)?.rank).toBe(1)
  })

  it('ranks round and rectangular pizzas together', () => {
    const round = pizza(1, 14, 15)
    const sheet = rectangle(2, 18, 13, 15)
    const ranks = rankPizzas([round, sheet])
    expect(ranks.get(2)?.rank).toBe(1)
    expect(ranks.get(1)?.rank).toBe(2)
  })

  it('leaves incomplete pizzas unranked without affecting the others', () => {
    const ranks = rankPizzas([pizza(1, 0, 10), pizza(2, 12, 12), pizza(3, 16, 18)])
    expect(ranks.has(1)).toBe(false)
    expect(ranks.size).toBe(2)
  })

  it('ranks nothing until two pizzas can be compared', () => {
    expect(rankPizzas([pizza(1, 12, 12)]).size).toBe(0)
    expect(rankPizzas([pizza(1, 12, 12), pizza(2, 0, 0)]).size).toBe(0)
  })
})

describe('createPizza', () => {
  it('names the pizza after its id and starts with a usable size and price', () => {
    const created = createPizza(7)
    expect(created.id).toBe(7)
    expect(created.name).toBe('Pizza 7')
    expect(pricePerSquareUnit(created, 'in')).not.toBeNull()
  })
})
