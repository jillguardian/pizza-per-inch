import { describe, expect, it } from 'vitest'
import { createOffer, INITIAL_OFFERS } from './offer'
import { createPizza } from './pizza'
import { parseSaved, SAVED_VERSION, serializeSaved, type SavedComparison } from './saved'

const knownCurrency = (code: string): boolean => ['USD', 'EUR'].includes(code)

const saved: SavedComparison = {
  offers: [
    ...INITIAL_OFFERS,
    {
      id: 7,
      name: 'Family deal',
      notes: 'Two pizzas, "extra" cheese',
      price: 24.5,
      pizzas: [
        { ...createPizza(3, 14), quantity: 2 },
        { ...createPizza(4), shape: 'rectangular', width: 30, length: 40, unit: 'cm' },
      ],
    },
  ],
  currency: 'EUR',
  priceUnit: 'cm',
  bundlesChosen: true,
}

type Fields = Record<string, unknown>
type Path = (string | number)[]
const REMOVE = Symbol('remove')

// The saved text with one value changed (or removed), as it would look if storage had been edited.
function withChange(path: Path, value: unknown): string {
  const data = JSON.parse(serializeSaved(saved)) as Fields
  let target: Record<string | number, unknown> = data
  for (const key of path.slice(0, -1)) target = target[key] as Record<string | number, unknown>
  const last = path[path.length - 1]
  if (value === REMOVE) delete target[last]
  else target[last] = value
  return JSON.stringify(data)
}

function withEdit(edit: (data: Fields) => void): string {
  const data = JSON.parse(serializeSaved(saved)) as Fields
  edit(data)
  return JSON.stringify(data)
}

function firstOffer(data: Fields): Fields {
  return (data.offers as Fields[])[0]
}

describe('saving and restoring a comparison', () => {
  it('restores exactly what was saved', () => {
    expect(parseSaved(serializeSaved(saved), knownCurrency)).toEqual(saved)
  })

  it('restores text with quotes and line breaks unchanged', () => {
    const tricky = { ...saved, offers: [{ ...createOffer(1), name: 'A "b"\nc', notes: '\\ é 🍕' }] }
    expect(parseSaved(serializeSaved(tricky), knownCurrency)).toEqual(tricky)
  })

  it('accepts having no offers, because someone can remove them all', () => {
    expect(parseSaved(serializeSaved({ ...saved, offers: [] }), knownCurrency)?.offers).toEqual([])
  })

  it('keeps the order of the offers, so a sorted list stays sorted', () => {
    const reversed = { ...saved, offers: [...saved.offers].reverse() }
    expect(parseSaved(serializeSaved(reversed), knownCurrency)?.offers.map((o) => o.id)).toEqual([
      7, 2, 1,
    ])
  })

  it('writes the version, so a later change to the shape can be told apart', () => {
    expect(JSON.parse(serializeSaved(saved)).version).toBe(SAVED_VERSION)
  })

  it('ignores fields it does not know, without keeping them', () => {
    const text = withEdit((data) => {
      data.zzUnknown = 'x'
      firstOffer(data).zzUnknown = 'y'
    })
    const restored = parseSaved(text, knownCurrency)
    expect(restored).toEqual(saved)
    expect(JSON.stringify(restored)).not.toContain('zzUnknown')
  })

  it('accepts sizes and prices that are not final yet, such as zero or negative', () => {
    const text = withEdit((data) => {
      firstOffer(data).price = 0
      ;(firstOffer(data).pizzas as Fields[])[0].diameter = -3
    })
    const restored = parseSaved(text, knownCurrency)
    expect(restored?.offers[0].price).toBe(0)
    expect(restored?.offers[0].pizzas[0].diameter).toBe(-3)
  })
})

describe('falling back when the saved data cannot be trusted', () => {
  it.each([
    ['nothing saved', null],
    ['an empty string', ''],
    ['text that is not JSON', '{not json'],
    ['JSON that is not an object', '[1, 2]'],
    ['null', 'null'],
  ])('returns nothing for %s', (_name, raw) => {
    expect(parseSaved(raw, knownCurrency)).toBeNull()
  })

  it.each<[string, Path, unknown]>([
    ['another version', ['version'], SAVED_VERSION + 1],
    ['no version', ['version'], REMOVE],
    ['offers that are not a list', ['offers'], 'none'],
    ['a currency the browser does not know', ['currency'], 'XXZ'],
    ['a currency that is not text', ['currency'], 5],
    ['an unknown price unit', ['priceUnit'], 'ft'],
    ['a bundles flag that is not true or false', ['bundlesChosen'], 'yes'],
    ['an offer that is not an object', ['offers'], [1]],
    ['an offer id that is not a whole number', ['offers', 0, 'id'], 1.5],
    ['an offer id of zero', ['offers', 0, 'id'], 0],
    ['two offers with the same id', ['offers', 1, 'id'], 1],
    ['an offer name that is not text', ['offers', 0, 'name'], 3],
    ['an offer price that is not a number', ['offers', 0, 'price'], '9'],
    ['an offer price that is not finite', ['offers', 0, 'price'], null],
    ['an offer with no pizzas', ['offers', 0, 'pizzas'], []],
    ['a pizza that is not an object', ['offers', 0, 'pizzas'], ['x']],
    ['an unknown shape', ['offers', 0, 'pizzas', 0, 'shape'], 'triangle'],
    ['an unknown pizza unit', ['offers', 0, 'pizzas', 0, 'unit'], 'ft'],
    ['a size that is not a number', ['offers', 0, 'pizzas', 0, 'diameter'], 'big'],
    ['a quantity that is missing', ['offers', 0, 'pizzas', 0, 'quantity'], REMOVE],
    ['two pizzas in an offer with the same id', ['offers', 2, 'pizzas', 1, 'id'], 3],
  ])('returns nothing for %s', (_name, path, value) => {
    expect(parseSaved(withChange(path, value), knownCurrency)).toBeNull()
  })

  it('throws away everything when one part is wrong, rather than restoring half', () => {
    expect(
      parseSaved(withChange(['offers', 0, 'pizzas', 0, 'shape'], 'triangle'), knownCurrency),
    ).toBeNull()
  })
})
