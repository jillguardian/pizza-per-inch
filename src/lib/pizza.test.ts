import { describe, expect, it } from 'vitest'
import { convertLength, createPizza, outline, pizzaArea, type Pizza, type SizeUnit } from './pizza'

const round = (diameter: number, unit: SizeUnit = 'in'): Pizza => ({
  ...createPizza(1, diameter),
  unit,
})

const rectangle = (width: number, length: number, unit: SizeUnit = 'in'): Pizza => ({
  ...createPizza(1),
  shape: 'rectangular',
  width,
  length,
  unit,
})

describe('convertLength', () => {
  it('converts between inches and centimeters in both directions', () => {
    expect(convertLength(10, 'in', 'cm')).toBeCloseTo(25.4)
    expect(convertLength(25.4, 'cm', 'in')).toBeCloseTo(10)
  })

  it('leaves the value alone when the units match', () => {
    expect(convertLength(10, 'in', 'in')).toBe(10)
  })
})

describe('pizzaArea', () => {
  it('uses the circle area for a round pizza, ignoring width and length', () => {
    expect(pizzaArea(round(10), 'in')).toBeCloseTo(Math.PI * 25)
  })

  it('multiplies width by length for a rectangular pizza, ignoring the diameter', () => {
    const sheet = { ...rectangle(12, 16), diameter: 99 }
    expect(pizzaArea(sheet, 'in')).toBe(192)
  })

  it('treats a square as a rectangle with equal sides', () => {
    expect(pizzaArea(rectangle(10, 10), 'in')).toBe(100)
  })

  it('converts a rectangle measured in centimeters', () => {
    expect(pizzaArea(rectangle(25.4, 50.8, 'cm'), 'in')).toBeCloseTo(200)
  })

  it('converts a round pizza to the requested unit', () => {
    const radiusCm = (10 * 2.54) / 2
    expect(pizzaArea(round(10), 'cm')).toBeCloseTo(Math.PI * radiusCm ** 2)
  })

  it('is the area of one pizza, whatever its quantity', () => {
    expect(pizzaArea({ ...round(10), quantity: 3 }, 'in')).toBeCloseTo(Math.PI * 25)
  })
})

describe('outline', () => {
  it('is a square as wide as the diameter for a round pizza', () => {
    expect(outline(round(10), 'in')).toEqual({ width: 10, length: 10 })
  })

  it('is the width and length for a rectangular pizza, in the requested unit', () => {
    const { width, length } = outline(rectangle(10, 20), 'cm')
    expect(width).toBeCloseTo(25.4)
    expect(length).toBeCloseTo(50.8)
  })
})

describe('createPizza', () => {
  it('starts as a single round pizza with a usable size', () => {
    const created = createPizza(3)
    expect(created).toMatchObject({ id: 3, shape: 'round', quantity: 1 })
    expect(pizzaArea(created, 'in')).toBeGreaterThan(0)
  })

  it('uses the given diameter', () => {
    expect(createPizza(1, 16).diameter).toBe(16)
  })
})
