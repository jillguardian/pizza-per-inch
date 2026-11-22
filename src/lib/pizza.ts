export type SizeUnit = 'in' | 'cm'

export interface Pizza {
  id: number
  name: string
  notes: string
  diameter: number
  unit: SizeUnit
  price: number
}

const CM_PER_INCH = 2.54

export function convertLength(value: number, from: SizeUnit, to: SizeUnit): number {
  if (from === to) return value
  return from === 'in' ? value * CM_PER_INCH : value / CM_PER_INCH
}

export function area(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2
}

export function pricePerSquareUnit(pizza: Pizza, unit: SizeUnit): number | null {
  const pizzaArea = area(convertLength(pizza.diameter, pizza.unit, unit))
  if (pizzaArea <= 0 || pizza.price <= 0) return null
  return pizza.price / pizzaArea
}

export function findBestValueId(pizzas: Pizza[]): number | null {
  let bestId: number | null = null
  let bestPrice = Infinity
  for (const pizza of pizzas) {
    const price = pricePerSquareUnit(pizza, 'in')
    if (price !== null && price < bestPrice) {
      bestPrice = price
      bestId = pizza.id
    }
  }
  return bestId
}

export const INITIAL_PIZZAS: Pizza[] = [
  { id: 1, name: 'Small', notes: '', diameter: 10, unit: 'in', price: 9 },
  { id: 2, name: 'Large', notes: '', diameter: 16, unit: 'in', price: 18 },
]

export function createPizza(id: number): Pizza {
  return { id, name: `Pizza ${id}`, notes: '', diameter: 12, unit: 'in', price: 12 }
}
