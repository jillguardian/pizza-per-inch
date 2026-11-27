import type { Offer } from './offer'
import type { Pizza, PizzaShape, SizeUnit } from './pizza'

// Bump this when the saved shape changes. Saved data with another version is discarded, not
// guessed at, because a half-understood comparison is worse than a fresh one.
export const SAVED_VERSION = 1

// What is remembered between visits.
export interface SavedComparison {
  offers: Offer[]
  currency: string
  priceUnit: SizeUnit
  bundlesChosen: boolean
}

const SHAPES: readonly PizzaShape[] = ['round', 'rectangular']
const UNITS: readonly SizeUnit[] = ['in', 'cm']

type Fields = Record<string, unknown>

function isRecord(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

function hasUniqueIds(items: { id: number }[]): boolean {
  return new Set(items.map((item) => item.id)).size === items.length
}

// The checks are about structure and types, not ranges: the inputs can briefly hold values that
// are not final yet, and one of them must not throw away the whole comparison.
function toPizza(value: unknown): Pizza | null {
  if (!isRecord(value)) return null
  const { id, shape, diameter, width, length, unit, quantity } = value
  if (!isId(id) || !isOneOf(SHAPES, shape) || !isOneOf(UNITS, unit)) return null
  if (!isNumber(diameter) || !isNumber(width) || !isNumber(length) || !isNumber(quantity)) {
    return null
  }
  return { id, shape, diameter, width, length, unit, quantity }
}

function toOffer(value: unknown): Offer | null {
  if (!isRecord(value)) return null
  const { id, name, notes, price, pizzas } = value
  if (!isId(id) || typeof name !== 'string' || typeof notes !== 'string' || !isNumber(price)) {
    return null
  }
  if (!Array.isArray(pizzas) || pizzas.length === 0) return null
  const parsed = pizzas.map(toPizza)
  if (parsed.some((pizza) => pizza === null)) return null
  const checked = parsed as Pizza[]
  if (!hasUniqueIds(checked)) return null
  return { id, name, notes, price, pizzas: checked }
}

export function serializeSaved(saved: SavedComparison): string {
  return JSON.stringify({
    version: SAVED_VERSION,
    offers: saved.offers,
    currency: saved.currency,
    priceUnit: saved.priceUnit,
    bundlesChosen: saved.bundlesChosen,
  })
}

// The saved comparison, or null when there is none or any part of it cannot be trusted.
export function parseSaved(
  raw: string | null,
  isCurrency: (code: string) => boolean,
): SavedComparison | null {
  if (raw === null) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(data) || data.version !== SAVED_VERSION) return null
  const { offers, currency, priceUnit, bundlesChosen } = data
  if (!Array.isArray(offers)) return null
  const parsed = offers.map(toOffer)
  if (parsed.some((offer) => offer === null)) return null
  const checked = parsed as Offer[]
  if (!hasUniqueIds(checked)) return null
  if (typeof currency !== 'string' || !isCurrency(currency)) return null
  if (!isOneOf(UNITS, priceUnit) || typeof bundlesChosen !== 'boolean') return null
  return { offers: checked, currency, priceUnit, bundlesChosen }
}
