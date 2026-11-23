export type SizeUnit = 'in' | 'cm'

export type PizzaShape = 'round' | 'rectangular'

// All three sizes are kept so switching shape back and forth doesn't lose what was typed.
// The shape decides which ones count.
export interface Pizza {
  id: number
  name: string
  notes: string
  shape: PizzaShape
  diameter: number
  width: number
  length: number
  unit: SizeUnit
  price: number
}

const CM_PER_INCH = 2.54

export function convertLength(value: number, from: SizeUnit, to: SizeUnit): number {
  if (from === to) return value
  return from === 'in' ? value * CM_PER_INCH : value / CM_PER_INCH
}

export function roundArea(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2
}

// The bounding box of the pizza in the given unit. A round pizza is as wide as it is long.
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

export function pizzaArea(pizza: Pizza, unit: SizeUnit): number {
  const { width, length } = outline(pizza, unit)
  return pizza.shape === 'round' ? roundArea(width) : width * length
}

export function pricePerSquareUnit(pizza: Pizza, unit: SizeUnit): number | null {
  const area = pizzaArea(pizza, unit)
  if (area <= 0 || pizza.price <= 0) return null
  return pizza.price / area
}

export interface PizzaRank {
  rank: number
  percentAboveBest: number
}

// Prices per area closer than this (relative) count as a tie, so float noise from unit
// conversion cannot split pizzas that cost the same.
const TIE_TOLERANCE = 1e-9

// Ranks comparable pizzas by price per square inch, so mixed units compare fairly. Ties share
// a rank and the next rank follows without a gap (1, 1, 2). Pizzas without a size or price get
// no entry, and nothing is ranked until at least two pizzas can be compared.
export function rankPizzas(pizzas: Pizza[]): Map<number, PizzaRank> {
  const comparable = pizzas
    .map((pizza) => ({ id: pizza.id, price: pricePerSquareUnit(pizza, 'in') }))
    .filter((entry): entry is { id: number; price: number } => entry.price !== null)
    .sort((a, b) => a.price - b.price)

  const ranks = new Map<number, PizzaRank>()
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

const DEFAULT_RECTANGLE = { width: 12, length: 16 }

export const INITIAL_PIZZAS: Pizza[] = [
  {
    id: 1,
    name: 'Small',
    notes: '',
    shape: 'round',
    diameter: 10,
    ...DEFAULT_RECTANGLE,
    unit: 'in',
    price: 9,
  },
  {
    id: 2,
    name: 'Large',
    notes: '',
    shape: 'round',
    diameter: 16,
    ...DEFAULT_RECTANGLE,
    unit: 'in',
    price: 18,
  },
]

export function createPizza(id: number): Pizza {
  return {
    id,
    name: `Pizza ${id}`,
    notes: '',
    shape: 'round',
    diameter: 12,
    ...DEFAULT_RECTANGLE,
    unit: 'in',
    price: 12,
  }
}
