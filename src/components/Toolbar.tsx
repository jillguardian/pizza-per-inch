import { Button, Group, NativeSelect } from '@mantine/core'
import type { ReactElement } from 'react'
import { listCurrencies, type Currency } from '../lib/currencies'
import type { SizeUnit } from '../lib/pizza'
import './Toolbar.css'

const CURRENCIES = listCurrencies()

interface ToolbarProps {
  currency: string
  priceUnit: SizeUnit
  onCurrencyChange: (currency: string) => void
  onPriceUnitChange: (unit: SizeUnit) => void
  onAddOffer: () => void
}

function toOptions(currencies: Currency[]): { value: string; label: string }[] {
  return currencies.map(({ code, name }) => ({ value: code, label: `${code} – ${name}` }))
}

const CURRENCY_OPTIONS = [
  { group: 'Common', items: toOptions(CURRENCIES.common) },
  { group: 'All currencies', items: toOptions(CURRENCIES.other) },
]

const PRICE_UNIT_OPTIONS = [
  { value: 'in', label: 'Square inch' },
  { value: 'cm', label: 'Square cm' },
]

export function Toolbar({
  currency,
  priceUnit,
  onCurrencyChange,
  onPriceUnitChange,
  onAddOffer,
}: Readonly<ToolbarProps>): ReactElement {
  return (
    <Group className="toolbar" align="flex-end">
      <NativeSelect
        label="Currency"
        data={CURRENCY_OPTIONS}
        value={currency}
        onChange={(event) => onCurrencyChange(event.currentTarget.value)}
      />
      <NativeSelect
        label="Show price per"
        data={PRICE_UNIT_OPTIONS}
        value={priceUnit}
        onChange={(event) => onPriceUnitChange(event.currentTarget.value as SizeUnit)}
      />
      <Button onClick={onAddOffer}>+ Add offer</Button>
    </Group>
  )
}
