import { Container, Text, Title } from '@mantine/core'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import './App.css'
import { ColorSchemeToggle } from './components/ColorSchemeToggle'
import { ADD_OFFER_ID, offerNameId } from './components/focusIds'
import { LiveRegion } from './components/LiveRegion'
import { OfferCard } from './components/OfferCard'
import { ProjectLinks } from './components/ProjectLinks'
import { Toolbar } from './components/Toolbar'
import { useAnnouncer } from './hooks/useAnnouncer'
import { useBestValueAnnouncement } from './hooks/useBestValueAnnouncement'
import { useOffers } from './hooks/useOffers'
import {
  NOTHING_TO_SORT,
  offerAdded,
  offerRemoved,
  pizzaAdded,
  pizzaRemoved,
  sortedByValue,
} from './lib/announcements'
import { detectLocaleCurrency } from './lib/currencies'
import { isBundle, rankOffers, sortByRank, type Offer } from './lib/offer'
import { outline, type SizeUnit } from './lib/pizza'

const DEFAULT_CURRENCY = detectLocaleCurrency() ?? 'USD'

export default function App(): ReactElement {
  const {
    offers,
    addOffer,
    updateOffer,
    updatePizza,
    addPizza,
    removePizza,
    removeOffer,
    sortOffers,
  } = useOffers()
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [priceUnit, setPriceUnit] = useState<SizeUnit>('in')
  const [bundlesChosen, setBundlesChosen] = useState(false)

  const ranks = rankOffers(offers)
  const { message, announce } = useAnnouncer()
  useBestValueAnnouncement(offers, ranks, announce)
  const focusAfterRemove = useRef<string | null>(null)

  // A removed card takes the focused button with it, so focus moves to the card that takes its
  // place, or the one before it, or the add button when none is left.
  function handleRemoveOffer(id: number): void {
    const index = offers.findIndex((offer) => offer.id === id)
    const neighbour = offers[index + 1] ?? offers[index - 1]
    focusAfterRemove.current = neighbour ? offerNameId(neighbour.id) : ADD_OFFER_ID
    announce(offerRemoved(offers[index].name, offers.length - 1))
    removeOffer(id)
  }

  function handleAddOffer(): void {
    addOffer()
    announce(offerAdded(offers.length + 1))
  }

  function handleSortOffers(): void {
    announce(
      ranks.size === 0
        ? NOTHING_TO_SORT
        : sortedByValue(sortByRank(offers).map((offer) => offer.name)),
    )
    sortOffers()
  }

  function handleAddPizza(offer: Offer): void {
    addPizza(offer.id)
    announce(pizzaAdded(offer.name, offer.pizzas.length + 1))
  }

  function handleRemovePizza(offer: Offer, pizzaId: number): void {
    removePizza(offer.id, pizzaId)
    announce(pizzaRemoved(offer.name, offer.pizzas.length - 1))
  }

  useEffect(() => {
    if (focusAfterRemove.current === null) return
    document.getElementById(focusAfterRemove.current)?.focus()
    focusAfterRemove.current = null
  }, [offers])

  const bundlesLocked = offers.some(isBundle)
  const showBundles = bundlesChosen || bundlesLocked
  const maxSizeInches = Math.max(
    ...offers.flatMap((offer) =>
      offer.pizzas.map((pizza) => {
        const { width, length } = outline(pizza, 'in')
        return Math.max(width, length)
      }),
    ),
  )
  const priceFormat = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
  })

  return (
    <Container component="main" size="lg" py="md">
      <LiveRegion message={message} />
      <div className="page-actions">
        <ColorSchemeToggle />
        <ProjectLinks />
      </div>
      <Title order={1} mb="xs">
        🍕 Pizza per Inch
      </Title>
      <Text size="lg" c="dimmed" mb="md" className="subtitle">
        <span>Compare pizza prices and sizes to find the best deal.</span>{' '}
        <span>Each card is one offer: a single pizza or a bundle, with one price.</span>
      </Text>

      <div className="workspace">
        <Toolbar
          currency={currency}
          priceUnit={priceUnit}
          onCurrencyChange={setCurrency}
          onPriceUnitChange={setPriceUnit}
          showBundles={showBundles}
          bundlesLocked={bundlesLocked}
          onAddOffer={handleAddOffer}
          onSortOffers={handleSortOffers}
          onBundlesChange={setBundlesChosen}
        />

        <div className="offers">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              currency={currency}
              priceUnit={priceUnit}
              priceFormat={priceFormat}
              rank={ranks.get(offer.id) ?? null}
              maxSizeInches={maxSizeInches}
              showBundles={showBundles}
              onChange={(changes) => updateOffer(offer.id, changes)}
              onPizzaChange={(pizzaId, changes) => updatePizza(offer.id, pizzaId, changes)}
              onAddPizza={() => handleAddPizza(offer)}
              onRemovePizza={(pizzaId) => handleRemovePizza(offer, pizzaId)}
              onRemove={() => handleRemoveOffer(offer.id)}
            />
          ))}
        </div>
      </div>
    </Container>
  )
}
