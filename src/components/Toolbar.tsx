import { Button, Checkbox, Group, NativeSelect, Stack } from '@mantine/core'
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
  showBundles: boolean
  bundlesLocked: boolean
  onAddOffer: () => void
  onBundlesChange: (enabled: boolean) => void
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
  showBundles,
  bundlesLocked,
  onAddOffer,
  onBundlesChange,
}: Readonly<ToolbarProps>): ReactElement {
  return (
    <Stack className="toolbar" gap="xs">
      <Group gap="xs" wrap="nowrap">
        <NativeSelect
          label="Currency"
          data={CURRENCY_OPTIONS}
          value={currency}
          onChange={(event) => onCurrencyChange(event.currentTarget.value)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <NativeSelect
          label="Show price per"
          data={PRICE_UNIT_OPTIONS}
          value={priceUnit}
          onChange={(event) => onPriceUnitChange(event.currentTarget.value as SizeUnit)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Group>
      <Group gap="md" justify="space-between" wrap="nowrap">
        <Button onClick={onAddOffer}>+ Add offer</Button>
        <Checkbox
          label="Multi-pizza deals"
          description={bundlesLocked ? 'An offer has several pizzas.' : undefined}
          checked={showBundles}
          disabled={bundlesLocked}
          onChange={(event) => onBundlesChange(event.currentTarget.checked)}
        />
      </Group>
    </Stack>
  )
}
