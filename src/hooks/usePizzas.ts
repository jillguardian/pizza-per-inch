import { useRef, useState } from 'react'
import { createPizza, INITIAL_PIZZAS, type Pizza } from '../lib/pizza'

interface UsePizzas {
  pizzas: Pizza[]
  addPizza: () => void
  updatePizza: (id: number, changes: Partial<Pizza>) => void
  removePizza: (id: number) => void
}

export function usePizzas(): UsePizzas {
  const [pizzas, setPizzas] = useState<Pizza[]>(INITIAL_PIZZAS)
  const nextId = useRef(Math.max(...INITIAL_PIZZAS.map((pizza) => pizza.id)) + 1)

  function addPizza(): void {
    const pizza = createPizza(nextId.current)
    nextId.current += 1
    setPizzas((current) => [...current, pizza])
  }

  function updatePizza(id: number, changes: Partial<Pizza>): void {
    setPizzas((current) => current.map((p) => (p.id === id ? { ...p, ...changes } : p)))
  }

  function removePizza(id: number): void {
    setPizzas((current) => current.filter((p) => p.id !== id))
  }

  return { pizzas, addPizza, updatePizza, removePizza }
}
