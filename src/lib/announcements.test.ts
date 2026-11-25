import { describe, expect, it } from 'vitest'
import {
  bestValue,
  NOTHING_TO_SORT,
  offerAdded,
  offerRemoved,
  pizzaAdded,
  pizzaRemoved,
  sortedByValue,
} from './announcements'

describe('announcements', () => {
  it('says how many offers there are after adding one', () => {
    expect(offerAdded(3)).toBe('Offer added. 3 offers.')
  })

  it('names the removed offer and says how many are left', () => {
    expect(offerRemoved('Small', 2)).toBe('Small removed. 2 offers left.')
    expect(offerRemoved('Small', 1)).toBe('Small removed. 1 offer left.')
    expect(offerRemoved('Small', 0)).toBe('Small removed. No offers left.')
  })

  it('says which pizza was added to which offer', () => {
    expect(pizzaAdded('Combo', 2)).toBe('Pizza 2 of 2 added to Combo.')
  })

  it('says how many pizzas are left after removing one', () => {
    expect(pizzaRemoved('Combo', 2)).toBe('Pizza removed from Combo. 2 pizzas left.')
    expect(pizzaRemoved('Combo', 1)).toBe('Pizza removed from Combo. 1 pizza left.')
  })

  it('lists the offers best first after sorting', () => {
    expect(sortedByValue(['Large', 'Small'])).toBe('Sorted by value, best first: Large, Small.')
  })

  it('explains why there is nothing to sort', () => {
    expect(NOTHING_TO_SORT).toContain('two offers')
  })

  it('names one best value, or says several are tied', () => {
    expect(bestValue(['Large'])).toBe('Large is now the best value.')
    expect(bestValue(['Large', 'Small'])).toBe('Large and Small are now tied for the best value.')
  })

  it('calls an offer with no name by a spoken name', () => {
    expect(offerRemoved('  ', 1)).toBe('Unnamed offer removed. 1 offer left.')
    expect(sortedByValue(['', 'Large'])).toBe('Sorted by value, best first: Unnamed offer, Large.')
  })
})
