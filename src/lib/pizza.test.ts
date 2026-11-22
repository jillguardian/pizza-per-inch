import { describe, expect, it } from 'vitest'
import {
  createPizza,
  findBestValueId,
  pricePerSquareUnit,
  type Pizza,
  type SizeUnit,
} from './pizza'

const pizza = (id: number, diameter: number, price: number, unit: SizeUnit = 'in'): Pizza => ({
  id,
  name: `Pizza ${id}`,
  notes: '',
  diameter,
  unit,
  price,
})

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
  })
})

describe('findBestValueId', () => {
  it('prefers the bigger pizza when it costs less per square inch', () => {
    const small = pizza(1, 10, 10)
    const large = pizza(2, 16, 18)
    expect(findBestValueId([small, large])).toBe(2)
  })

  it('compares pizzas sized in different units', () => {
    const inches = pizza(1, 12, 12)
    const centimeters = pizza(2, 30, 10, 'cm')
    expect(findBestValueId([inches, centimeters])).toBe(2)
  })

  it('ignores incomplete pizzas', () => {
    expect(findBestValueId([pizza(1, 0, 10), pizza(2, 12, 12)])).toBe(2)
  })

  it('returns null when nothing can be compared', () => {
    expect(findBestValueId([pizza(1, 0, 0)])).toBeNull()
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
