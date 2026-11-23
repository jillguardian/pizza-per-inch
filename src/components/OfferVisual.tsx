import { ActionIcon } from '@mantine/core'
import type { ReactElement } from 'react'
import { outline, type Pizza } from '../lib/pizza'
import { ChevronIcon } from './ChevronIcon'
import { PizzaVisual } from './PizzaVisual'
import './OfferVisual.css'

interface OfferVisualProps {
  pizza: Pizza
  maxSizeInches: number
  index: number
  count: number
  onSelect: (index: number) => void
}

function describe(pizza: Pizza): string {
  return pizza.shape === 'round'
    ? `${pizza.diameter} ${pizza.unit} pizza`
    : `${pizza.width} × ${pizza.length} ${pizza.unit} rectangular pizza`
}

// Draws the pizza being edited, with arrows to move through the pizzas of an offer. Every pizza
// of every offer shares one scale, so sizes can be compared by eye across cards and arrows.
export function OfferVisual({
  pizza,
  maxSizeInches,
  index,
  count,
  onSelect,
}: Readonly<OfferVisualProps>): ReactElement {
  const { width, length } = outline(pizza, 'in')
  return (
    <div className="offer-visual">
      {count > 1 && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size={32}
          aria-label="Previous pizza"
          disabled={index === 0}
          onClick={() => onSelect(index - 1)}
          className="arrow previous"
        >
          <ChevronIcon direction="left" />
        </ActionIcon>
      )}
      <div className="picture">
        <PizzaVisual
          shape={pizza.shape}
          width={width}
          length={length}
          maxSize={maxSizeInches}
          label={describe(pizza)}
        />
      </div>
      {count > 1 && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size={32}
          aria-label="Next pizza"
          disabled={index === count - 1}
          onClick={() => onSelect(index + 1)}
          className="arrow next"
        >
          <ChevronIcon direction="right" />
        </ActionIcon>
      )}
    </div>
  )
}
