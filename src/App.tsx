import { Container, Text, Title } from '@mantine/core'
import { useState, type ReactElement } from 'react'
import './App.css'
import { OfferCard } from './components/OfferCard'
import { Toolbar } from './components/Toolbar'
import { useOffers } from './hooks/useOffers'
import { detectLocaleCurrency } from './lib/currencies'
import { rankOffers } from './lib/offer'
import { outline, type SizeUnit } from './lib/pizza'

const DEFAULT_CURRENCY = detectLocaleCurrency() ?? 'USD'

export default function App(): ReactElement {
  const { offers, addOffer, updateOffer, updatePizza, addPizza, removePizza, removeOffer } =
    useOffers()
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [priceUnit, setPriceUnit] = useState<SizeUnit>('in')

  const ranks = rankOffers(offers)
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
      <Title order={1} mb="xs">
        🍕 Pizza per Inch
      </Title>
      <Text size="lg" c="dimmed" mb="md" className="subtitle">
        <span>Compare pizza prices and sizes to find the best deal.</span>{' '}
        <span>Each card is one offer: a single pizza or a bundle, with one price.</span>
      </Text>

      <Toolbar
        currency={currency}
        priceUnit={priceUnit}
        onCurrencyChange={setCurrency}
        onPriceUnitChange={setPriceUnit}
        onAddOffer={addOffer}
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
            onChange={(changes) => updateOffer(offer.id, changes)}
            onPizzaChange={(pizzaId, changes) => updatePizza(offer.id, pizzaId, changes)}
            onAddPizza={() => addPizza(offer.id)}
            onRemovePizza={(pizzaId) => removePizza(offer.id, pizzaId)}
            onRemove={() => removeOffer(offer.id)}
          />
        ))}
      </div>
    </Container>
  )
}
