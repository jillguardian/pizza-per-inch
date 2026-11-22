import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { INITIAL_PIZZAS } from '../lib/pizza'
import { usePizzas } from './usePizzas'

describe('usePizzas', () => {
  it('starts with the example pizzas', () => {
    const { result } = renderHook(() => usePizzas())
    expect(result.current.pizzas).toEqual(INITIAL_PIZZAS)
  })

  it('adds pizzas with unique ids', () => {
    const { result } = renderHook(() => usePizzas())

    act(() => result.current.addPizza())
    act(() => result.current.addPizza())

    const ids = result.current.pizzas.map((p) => p.id)
    expect(ids).toHaveLength(INITIAL_PIZZAS.length + 2)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not reuse the id of a removed pizza', () => {
    const { result } = renderHook(() => usePizzas())

    act(() => result.current.addPizza())
    const addedId = result.current.pizzas.at(-1)!.id
    act(() => result.current.removePizza(addedId))
    act(() => result.current.addPizza())

    expect(result.current.pizzas.some((p) => p.id === addedId)).toBe(false)
  })

  it('updates only the chosen pizza', () => {
    const { result } = renderHook(() => usePizzas())

    act(() => result.current.updatePizza(1, { name: 'Tiny' }))

    expect(result.current.pizzas[0].name).toBe('Tiny')
    expect(result.current.pizzas[1]).toEqual(INITIAL_PIZZAS[1])
  })

  it('removes the chosen pizza', () => {
    const { result } = renderHook(() => usePizzas())

    act(() => result.current.removePizza(1))

    expect(result.current.pizzas.map((p) => p.id)).toEqual([2])
  })
})
