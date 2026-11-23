export type SizeUnit = 'in' | 'cm'

export type PizzaShape = 'round' | 'rectangular'

// All three sizes are kept so switching shape back and forth doesn't lose what was typed.
// The shape decides which ones count.
export interface Pizza {
  id: number
  shape: PizzaShape
  diameter: number
  width: number
  length: number
  unit: SizeUnit
  quantity: number
}

const CM_PER_INCH = 2.54

const DEFAULT_RECTANGLE = { width: 12, length: 16 }

export function convertLength(value: number, from: SizeUnit, to: SizeUnit): number {
  if (from === to) return value
  return from === 'in' ? value * CM_PER_INCH : value / CM_PER_INCH
}

export function roundArea(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2
}

// The bounding box of one pizza in the given unit. A round pizza is as wide as it is long.
export function outline(pizza: Pizza, unit: SizeUnit): { width: number; length: number } {
  if (pizza.shape === 'round') {
    const diameter = convertLength(pizza.diameter, pizza.unit, unit)
    return { width: diameter, length: diameter }
  }
  return {
    width: convertLength(pizza.width, pizza.unit, unit),
    length: convertLength(pizza.length, pizza.unit, unit),
  }
}

// The area of one pizza, ignoring its quantity.
export function pizzaArea(pizza: Pizza, unit: SizeUnit): number {
  const { width, length } = outline(pizza, unit)
  return pizza.shape === 'round' ? roundArea(width) : width * length
}

export function createPizza(id: number, diameter = 12): Pizza {
  return {
    id,
    shape: 'round',
    diameter,
    ...DEFAULT_RECTANGLE,
    unit: 'in',
    quantity: 1,
  }
}
