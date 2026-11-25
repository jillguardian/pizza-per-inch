import { Button, Checkbox, NativeSelect } from '@mantine/core'
import type { ReactElement } from 'react'
import { listCurrencies, type Currency } from '../lib/currencies'
import type { SizeUnit } from '../lib/pizza'
import { ADD_OFFER_ID } from './focusIds'
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
  onSortOffers: () => void
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
  onSortOffers,
  onBundlesChange,
}: Readonly<ToolbarProps>): ReactElement {
  return (
    <>
      <div className="toolbar-settings">
        <NativeSelect
          className="toolbar-select"
          label="Currency"
          data={CURRENCY_OPTIONS}
          value={currency}
          onChange={(event) => onCurrencyChange(event.currentTarget.value)}
        />
        <NativeSelect
          className="toolbar-select"
          label="Show price per"
          data={PRICE_UNIT_OPTIONS}
          value={priceUnit}
          onChange={(event) => onPriceUnitChange(event.currentTarget.value as SizeUnit)}
        />
      </div>
      <div className="toolbar-strip" aria-hidden="true" />
      <div className="toolbar-actions">
        <Button id={ADD_OFFER_ID} onClick={onAddOffer}>
          + Add offer
        </Button>
        <Button variant="default" onClick={onSortOffers}>
          Sort by value
        </Button>
      </div>
      <Checkbox
        className="toolbar-checkbox"
        label="Multi-pizza deals"
        description={bundlesLocked ? 'An offer has several pizzas.' : undefined}
        checked={showBundles}
        disabled={bundlesLocked}
        onChange={(event) => onBundlesChange(event.currentTarget.checked)}
      />
    </>
  )
}
