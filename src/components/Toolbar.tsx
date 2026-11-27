import { Button, NativeSelect, Switch, VisuallyHidden } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import type { ReactElement } from 'react'
import { listCurrencies, type Currency } from '../lib/currencies'
import type { SizeUnit } from '../lib/pizza'
import { PHONE_QUERY } from './breakpoints'
import { ClearButton } from './ClearButton'
import { ADD_OFFER_ID } from './focusIds'
import { PlusIcon } from './PlusIcon'
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
  offerCount: number
  onClear: () => void
  onBundlesChange: (enabled: boolean) => void
}

function toOptions(currencies: Currency[]): { value: string; label: string }[] {
  return currencies.map(({ code, name }) => ({ value: code, label: `${code} – ${name}` }))
}

const CURRENCY_OPTIONS = [
  { group: 'Common', items: toOptions(CURRENCIES.common) },
  { group: 'All currencies', items: toOptions(CURRENCIES.other) },
]

// While an offer has several pizzas, the switch stays on and cannot be turned off. The sighted
// reason is the "(in use)" in the label, which adds no height. A screen reader hears the sentence.
const LOCKED_REASON_ID = 'deals-locked-reason'

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
  offerCount,
  onClear,
  onBundlesChange,
}: Readonly<ToolbarProps>): ReactElement {
  // Clear joins the pinned buttons on a phone, and sits at the right end of the settings row
  // elsewhere. It is rendered in one place only, so there is never a second Clear button hidden
  // in the page.
  const phone = useMediaQuery(PHONE_QUERY, false, { getInitialValueInEffect: false })
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
          <div className="toolbar-clear">
            <ClearButton offerCount={offerCount} onConfirm={onClear} iconOnly={phone} />
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
          title={phone ? 'Sort by value' : undefined}
          classNames={{ root: 'toolbar-icon-only', section: 'toolbar-button-icon' }}
        >
          <span className="toolbar-button-label">Sort by value</span>
        </Button>
        {phone && (
          <div className="toolbar-clear">
            <ClearButton offerCount={offerCount} onConfirm={onClear} iconOnly={phone} />
          </div>
        )}
      </div>
      <div className="toolbar-deals">
        {/* On a phone the switch is at the left of its own row, with its label after it. From 768px
            it is at the right, with its label before it, so the switch itself stays at the right
            edge, whether or not "(in use)" is added to the label. */}
        <Switch
          labelPosition={phone ? 'right' : 'left'}
          label={
            <>
              Multi-pizza deals
              {bundlesLocked && <span aria-hidden="true"> (in use)</span>}
            </>
          }
          checked={showBundles}
          disabled={bundlesLocked}
          aria-describedby={bundlesLocked ? LOCKED_REASON_ID : undefined}
          onChange={(event) => onBundlesChange(event.currentTarget.checked)}
        />
        {bundlesLocked && (
          <VisuallyHidden id={LOCKED_REASON_ID}>An offer has several pizzas.</VisuallyHidden>
        )}
      </div>
    </>
  )
}
