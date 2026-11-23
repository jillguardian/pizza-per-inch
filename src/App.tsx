import { Container, Text, Title } from '@mantine/core'
import { useState, type ReactElement } from 'react'
import './App.css'
import { PizzaCard } from './components/PizzaCard'
import { Toolbar } from './components/Toolbar'
import { usePizzas } from './hooks/usePizzas'
import { detectLocaleCurrency } from './lib/currencies'
import { outline, rankPizzas, type SizeUnit } from './lib/pizza'

const DEFAULT_CURRENCY = detectLocaleCurrency() ?? 'USD'

export default function App(): ReactElement {
  const { pizzas, addPizza, updatePizza, removePizza } = usePizzas()
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [priceUnit, setPriceUnit] = useState<SizeUnit>('in')

  const ranks = rankPizzas(pizzas)
  const maxSizeInches = Math.max(
    ...pizzas.map((p) => {
      const { width, length } = outline(p, 'in')
      return Math.max(width, length)
    }),
  )
  const priceFormat = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
  })

  return (
    <Container component="main" size="md" py="md">
      <Title order={1}>🍕 Pizza per Inch</Title>
      <Text size="lg" c="dimmed" mb="md">
        Compare pizza prices and sizes to find the best deal.
      </Text>

      <Toolbar
        currency={currency}
        priceUnit={priceUnit}
        onCurrencyChange={setCurrency}
        onPriceUnitChange={setPriceUnit}
        onAddPizza={addPizza}
      />

      <div className="pizzas">
        {pizzas.map((pizza) => (
          <PizzaCard
            key={pizza.id}
            pizza={pizza}
            currency={currency}
            priceUnit={priceUnit}
            priceFormat={priceFormat}
            rank={ranks.get(pizza.id) ?? null}
            maxSizeInches={maxSizeInches}
            onChange={(changes) => updatePizza(pizza.id, changes)}
            onRemove={() => removePizza(pizza.id)}
          />
        ))}
      </div>
    </Container>
  )
}
