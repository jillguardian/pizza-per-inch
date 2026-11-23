import { useRef, useState } from 'react'
import { createOffer, INITIAL_OFFERS, type Offer } from '../lib/offer'
import type { Pizza } from '../lib/pizza'

type OfferChanges = Partial<Pick<Offer, 'name' | 'notes' | 'price'>>

interface UseOffers {
  offers: Offer[]
  addOffer: () => void
  updateOffer: (id: number, changes: OfferChanges) => void
  updatePizza: (offerId: number, pizzaId: number, changes: Partial<Pizza>) => void
  removeOffer: (id: number) => void
}

export function useOffers(): UseOffers {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS)
  const nextId = useRef(Math.max(...INITIAL_OFFERS.map((offer) => offer.id)) + 1)

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

  function removeOffer(id: number): void {
    setOffers((current) => current.filter((o) => o.id !== id))
  }

  return { offers, addOffer, updateOffer, updatePizza, removeOffer }
}
