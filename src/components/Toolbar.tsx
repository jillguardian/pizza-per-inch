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
  onAddPizza: () => void
}

function CurrencyOptions({ currencies }: Readonly<{ currencies: Currency[] }>): ReactElement[] {
  return currencies.map(({ code, name }) => (
    <option key={code} value={code}>
      {code} – {name}
    </option>
  ))
}

export function Toolbar({
  currency,
  priceUnit,
  onCurrencyChange,
  onPriceUnitChange,
  onAddPizza,
}: Readonly<ToolbarProps>): ReactElement {
  return (
    <div className="toolbar">
      <div className="settings">
        <label>
          Currency
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)}>
            <optgroup label="Common">
              <CurrencyOptions currencies={CURRENCIES.common} />
            </optgroup>
            <optgroup label="All currencies">
              <CurrencyOptions currencies={CURRENCIES.other} />
            </optgroup>
          </select>
        </label>
        <label>
          Show price per
          <select value={priceUnit} onChange={(e) => onPriceUnitChange(e.target.value as SizeUnit)}>
            <option value="in">Square inch</option>
            <option value="cm">Square cm</option>
          </select>
        </label>
      </div>

      <button onClick={onAddPizza}>+ Add pizza</button>
    </div>
  )
}
