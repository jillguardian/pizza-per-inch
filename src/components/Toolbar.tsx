import { Button, Checkbox, NativeSelect } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import type { ReactElement } from 'react'
import { listCurrencies, type Currency } from '../lib/currencies'
import type { SizeUnit } from '../lib/pizza'
import { ADD_OFFER_ID } from './focusIds'
import { PlusIcon } from './PlusIcon'
import { ResetButton } from './ResetButton'
import { SortIcon } from './SortIcon'
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
  onReset: () => void
  onBundlesChange: (enabled: boolean) => void
}

function toOptions(currencies: Currency[]): { value: string; label: string }[] {
  return currencies.map(({ code, name }) => ({ value: code, label: `${code} – ${name}` }))
}

const CURRENCY_OPTIONS = [
  { group: 'Common', items: toOptions(CURRENCIES.common) },
  { group: 'All currencies', items: toOptions(CURRENCIES.other) },
]

// Below this width (48em, the same breakpoint as Toolbar.css) Reset joins the pinned buttons.
// Everywhere else it sits at the right end of the settings row. It is rendered in one place only,
// so there is never a second Reset button hidden in the page.
const PHONE = '(max-width: 47.99em)'

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
  onReset,
  onBundlesChange,
}: Readonly<ToolbarProps>): ReactElement {
  const phone = useMediaQuery(PHONE, false, { getInitialValueInEffect: false })
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
        {!phone && (
          <div className="toolbar-reset">
            <ResetButton onConfirm={onReset} />
          </div>
        )}
      </div>
      <div className="toolbar-strip" aria-hidden="true" />
      <div className="toolbar-actions">
        <Button id={ADD_OFFER_ID} leftSection={<PlusIcon />} onClick={onAddOffer}>
          Add offer
        </Button>
        <Button
          variant="default"
          leftSection={<SortIcon />}
          onClick={onSortOffers}
          aria-label="Sort by value"
          title="Sort by value"
          classNames={{ root: 'toolbar-icon-only', section: 'toolbar-button-icon' }}
        >
          <span className="toolbar-button-label">Sort by value</span>
        </Button>
        {phone && (
          <div className="toolbar-reset">
            <ResetButton onConfirm={onReset} />
          </div>
        )}
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
