import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { INITIAL_OFFERS } from '../lib/offer'
import { useOffers } from './useOffers'

describe('useOffers', () => {
  it('starts with the example offers', () => {
    const { result } = renderHook(() => useOffers())
    expect(result.current.offers).toEqual(INITIAL_OFFERS)
  })

  it('adds offers with unique ids', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.addOffer())
    act(() => result.current.addOffer())

    const ids = result.current.offers.map((o) => o.id)
    expect(ids).toHaveLength(INITIAL_OFFERS.length + 2)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not reuse the id of a removed offer', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.addOffer())
    const addedOffer = result.current.offers.at(-1)
    if (!addedOffer) throw new Error('Expected an offer to be added')
    const addedId = addedOffer.id
    act(() => result.current.removeOffer(addedId))
    act(() => result.current.addOffer())

    expect(result.current.offers.some((o) => o.id === addedId)).toBe(false)
  })

  it('updates only the chosen offer', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.updateOffer(1, { name: 'Tiny', price: 5 }))

    expect(result.current.offers[0]).toMatchObject({ name: 'Tiny', price: 5 })
    expect(result.current.offers[1]).toEqual(INITIAL_OFFERS[1])
  })

  it('updates only the chosen pizza of the chosen offer', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.updatePizza(1, 1, { diameter: 8, unit: 'cm' }))

    expect(result.current.offers[0].pizzas[0]).toMatchObject({ diameter: 8, unit: 'cm' })
    expect(result.current.offers[0].name).toBe(INITIAL_OFFERS[0].name)
    expect(result.current.offers[1]).toEqual(INITIAL_OFFERS[1])
  })

  it('adds a pizza with a unique id to the chosen offer only', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.addPizza(1))
    act(() => result.current.addPizza(1))

    const ids = result.current.offers[0].pizzas.map((p) => p.id)
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    expect(result.current.offers[1]).toEqual(INITIAL_OFFERS[1])
  })

  it('removes the chosen pizza from an offer with several', () => {
    const { result } = renderHook(() => useOffers())
    act(() => result.current.addPizza(1))
    const [first, added] = result.current.offers[0].pizzas

    act(() => result.current.removePizza(1, first.id))

    expect(result.current.offers[0].pizzas).toEqual([added])
  })

  it('keeps the last pizza of an offer', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.removePizza(1, 1))

    expect(result.current.offers[0].pizzas).toHaveLength(1)
  })

  it('removes the chosen offer', () => {
    const { result } = renderHook(() => useOffers())

    act(() => result.current.removeOffer(1))

    expect(result.current.offers.map((o) => o.id)).toEqual([2])
  })
})
