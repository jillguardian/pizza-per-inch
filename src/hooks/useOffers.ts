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
  clearOffers: () => void
}

// Ids carry on from the highest one given, so an offer or pizza added later never reuses one. The
// list may be empty, so the highest id starts from 0.
function nextOfferId(offers: Offer[]): number {
  return Math.max(0, ...offers.map((offer) => offer.id)) + 1
}

function nextPizzaIdFor(offers: Offer[]): number {
  return Math.max(0, ...offers.flatMap((offer) => offer.pizzas.map((pizza) => pizza.id))) + 1
}

export function useOffers(initialOffers: Offer[] = INITIAL_OFFERS): UseOffers {
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const nextId = useRef(nextOfferId(initialOffers))
  const nextPizzaId = useRef(nextPizzaIdFor(initialOffers))

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

  // No offers, with the ids counting from the start again, so the next offer is "Offer 1".
  function clearOffers(): void {
    setOffers([])
    nextId.current = nextOfferId([])
    nextPizzaId.current = nextPizzaIdFor([])
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
    clearOffers,
  }
}
