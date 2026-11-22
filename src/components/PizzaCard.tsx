import type { ReactElement } from 'react'
import { convertLength, pricePerSquareUnit, type Pizza, type SizeUnit } from '../lib/pizza'
import { NumberInput } from './NumberInput'
import { PizzaVisual } from './PizzaVisual'
import './PizzaCard.css'

interface PizzaCardProps {
  pizza: Pizza
  currency: string
  priceUnit: SizeUnit
  priceFormat: Intl.NumberFormat
  isBest: boolean
  maxDiameterInches: number
  onChange: (changes: Partial<Pizza>) => void
  onRemove: () => void
}

export function PizzaCard({
  pizza,
  currency,
  priceUnit,
  priceFormat,
  isBest,
  maxDiameterInches,
  onChange,
  onRemove,
}: Readonly<PizzaCardProps>): ReactElement {
  const unitPrice = pricePerSquareUnit(pizza, priceUnit)

  return (
    <section className={isBest ? 'pizza best' : 'pizza'}>
      <div className="visual">
        <PizzaVisual
          diameter={convertLength(pizza.diameter, pizza.unit, 'in')}
          maxDiameter={maxDiameterInches}
          label={`${pizza.diameter} ${pizza.unit} pizza`}
        />
      </div>
      <input
        aria-label="Name"
        value={pizza.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <label>
        Diameter
        <span className="diameter">
          <NumberInput value={pizza.diameter} onChange={(diameter) => onChange({ diameter })} />
          <select
            aria-label="Diameter unit"
            value={pizza.unit}
            onChange={(e) => onChange({ unit: e.target.value as SizeUnit })}
          >
            <option value="in">in</option>
            <option value="cm">cm</option>
          </select>
        </span>
      </label>
      <label>
        Price ({currency})
        <NumberInput step="0.01" value={pizza.price} onChange={(price) => onChange({ price })} />
      </label>
      <label>
        Notes
        <textarea
          rows={2}
          value={pizza.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </label>
      <p className="result">
        {unitPrice === null ? '—' : `${priceFormat.format(unitPrice)} / ${priceUnit}²`}
      </p>
      <p className={isBest ? 'badge' : 'badge reserved'}>Best value</p>
      <button onClick={onRemove}>Remove</button>
    </section>
  )
}
