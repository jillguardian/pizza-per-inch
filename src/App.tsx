import { Container, Text, Title } from '@mantine/core'
import { useState, type ReactElement } from 'react'
import './App.css'
import { PizzaCard } from './components/PizzaCard'
import { Toolbar } from './components/Toolbar'
import { usePizzas } from './hooks/usePizzas'
import { detectLocaleCurrency } from './lib/currencies'
import { convertLength, findBestValueId, type SizeUnit } from './lib/pizza'

const DEFAULT_CURRENCY = detectLocaleCurrency() ?? 'USD'

export default function App(): ReactElement {
  const { pizzas, addPizza, updatePizza, removePizza } = usePizzas()
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [priceUnit, setPriceUnit] = useState<SizeUnit>('in')

  const bestValueId = findBestValueId(pizzas)
  const maxDiameterInches = Math.max(...pizzas.map((p) => convertLength(p.diameter, p.unit, 'in')))
  const priceFormat = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 4,
  })

  return (
    <Container component="main" size="md" py="md">
      <Title order={1}>🍕 Pizza per inch</Title>
      <Text mb="md">
        Enter diameter and price. The lowest price per area wins, even across different units.
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
            isBest={pizza.id === bestValueId && pizzas.length > 1}
            maxDiameterInches={maxDiameterInches}
            onChange={(changes) => updatePizza(pizza.id, changes)}
            onRemove={() => removePizza(pizza.id)}
          />
        ))}
      </div>
    </Container>
  )
}
