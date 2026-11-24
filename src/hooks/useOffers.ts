import { useRef, useState } from 'react'
import { createOffer, INITIAL_OFFERS, sortByRank, type Offer } from '../lib/offer'
import { createPizza, type Pizza } from '../lib/pizza'

type OfferChanges = Partial<Pick<Offer, 'name' | 'notes' | 'price'>>

interface UseOffers {
  offers: Offer[]
  addOffer: () => void
  updateOffer: (id: number, changes: OfferChanges) => void
  updatePizza: (offerId: number, pizzaId: number, changes: Partial<Pizza>) => void
  addPizza: (offerId: number) => void
  removePizza: (offerId: number, pizzaId: number) => void
  removeOffer: (id: number) => void
  sortOffers: () => void
}

export function useOffers(): UseOffers {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS)
  const nextId = useRef(Math.max(...INITIAL_OFFERS.map((offer) => offer.id)) + 1)
  const nextPizzaId = useRef(
    Math.max(...INITIAL_OFFERS.flatMap((offer) => offer.pizzas.map((pizza) => pizza.id))) + 1,
  )

  function addOffer(): void {
    const offer = createOffer(nextId.current)
    nextId.current += 1
    setOffers((current) => [...current, offer])
  }

  function updateOffer(id: number, changes: OfferChanges): void {
    setOffers((current) => current.map((o) => (o.id === id ? { ...o, ...changes } : o)))
  }

  function updatePizza(offerId: number, pizzaId: number, changes: Partial<Pizza>): void {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId
          ? {
              ...offer,
              pizzas: offer.pizzas.map((p) => (p.id === pizzaId ? { ...p, ...changes } : p)),
            }
          : offer,
      ),
    )
  }

  // Ids only go up, so a removed pizza's id is never given to a new one.
  function addPizza(offerId: number): void {
    const pizza = createPizza(nextPizzaId.current)
    nextPizzaId.current += 1
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId ? { ...offer, pizzas: [...offer.pizzas, pizza] } : offer,
      ),
    )
  }

  // An offer always keeps at least one pizza.
  function removePizza(offerId: number, pizzaId: number): void {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId && offer.pizzas.length > 1
          ? { ...offer, pizzas: offer.pizzas.filter((p) => p.id !== pizzaId) }
          : offer,
      ),
    )
  }

  function removeOffer(id: number): void {
    setOffers((current) => current.filter((o) => o.id !== id))
  }

  function sortOffers(): void {
    setOffers(sortByRank)
  }

  return {
    offers,
    addOffer,
    updateOffer,
    updatePizza,
    addPizza,
    removePizza,
    removeOffer,
    sortOffers,
  }
}
