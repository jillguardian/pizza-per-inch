import {
  ActionIcon,
  Badge,
  Card,
  Group,
  NativeSelect,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import type { ReactElement } from 'react'
import { pricePerSquareUnit, type Offer, type OfferRank } from '../lib/offer'
import { outline, type Pizza, type PizzaShape, type SizeUnit } from '../lib/pizza'
import { PizzaVisual } from './PizzaVisual'
import { TrashIcon } from './TrashIcon'
import './OfferCard.css'

interface OfferCardProps {
  offer: Offer
  currency: string
  priceUnit: SizeUnit
  priceFormat: Intl.NumberFormat
  rank: OfferRank | null
  maxSizeInches: number
  onChange: (changes: Partial<Pick<Offer, 'name' | 'notes' | 'price'>>) => void
  onPizzaChange: (pizzaId: number, changes: Partial<Pizza>) => void
  onRemove: () => void
}

const SIZE_UNIT_OPTIONS = ['in', 'cm']
const SHAPE_OPTIONS = [
  { value: 'round', label: 'Round' },
  { value: 'rectangular', label: 'Rectangle' },
]

// Mantine reports partial input such as "." as a string, which Number() turns into NaN.
function toNumber(value: number | string): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

// The number fields are uncontrolled (defaultValue) so Mantine owns the typed text,
// including partial input like "0." and cleared fields.
export function OfferCard({
  offer,
  currency,
  priceUnit,
  priceFormat,
  rank,
  maxSizeInches,
  onChange,
  onPizzaChange,
  onRemove,
}: Readonly<OfferCardProps>): ReactElement {
  // An offer holds one pizza until the card can list several.
  const pizza = offer.pizzas[0]
  const unitPrice = pricePerSquareUnit(offer, priceUnit)
  const isBest = rank?.rank === 1
  const visualOutline = outline(pizza, 'in')
  const visualLabel =
    pizza.shape === 'round'
      ? `${pizza.diameter} ${pizza.unit} pizza`
      : `${pizza.width} × ${pizza.length} ${pizza.unit} rectangular pizza`

  return (
    <Card
      component="section"
      withBorder
      padding="md"
      radius="md"
      className={isBest ? 'offer best' : 'offer'}
    >
      {rank && (
        <Badge color={isBest ? 'green' : 'gray'} className="rank">
          {isBest ? `#${rank.rank} Best value` : `#${rank.rank}`}
        </Badge>
      )}
      <Stack gap="xs">
        <div className="visual">
          <PizzaVisual
            shape={pizza.shape}
            width={visualOutline.width}
            length={visualOutline.length}
            maxSize={maxSizeInches}
            label={visualLabel}
          />
        </div>
        <TextInput
          aria-label="Name"
          value={offer.name}
          onChange={(event) => onChange({ name: event.currentTarget.value })}
        />
        <Group gap="xs" wrap="nowrap">
          <NativeSelect
            aria-label="Shape"
            data={SHAPE_OPTIONS}
            value={pizza.shape}
            onChange={(event) =>
              onPizzaChange(pizza.id, { shape: event.currentTarget.value as PizzaShape })
            }
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="light"
            color="red"
            size={36}
            aria-label="Remove"
            title="Remove"
            onClick={onRemove}
          >
            <TrashIcon />
          </ActionIcon>
        </Group>
        <Group key={pizza.id} gap="xs" align="flex-end" wrap="nowrap">
          {pizza.shape === 'round' ? (
            <NumberInput
              label="Diameter"
              min={0}
              allowNegative={false}
              allowLeadingZeros={false}
              hideControls
              defaultValue={pizza.diameter}
              onChange={(value) => onPizzaChange(pizza.id, { diameter: toNumber(value) })}
              style={{ flex: 1 }}
            />
          ) : (
            <>
              <NumberInput
                label="Width"
                min={0}
                allowNegative={false}
                allowLeadingZeros={false}
                hideControls
                defaultValue={pizza.width}
                onChange={(value) => onPizzaChange(pizza.id, { width: toNumber(value) })}
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Length"
                min={0}
                allowNegative={false}
                allowLeadingZeros={false}
                hideControls
                defaultValue={pizza.length}
                onChange={(value) => onPizzaChange(pizza.id, { length: toNumber(value) })}
                style={{ flex: 1 }}
              />
            </>
          )}
          <NativeSelect
            aria-label="Size unit"
            data={SIZE_UNIT_OPTIONS}
            value={pizza.unit}
            onChange={(event) =>
              onPizzaChange(pizza.id, { unit: event.currentTarget.value as SizeUnit })
            }
            w={72}
          />
        </Group>
        <NumberInput
          label={`Price (${currency})`}
          min={0}
          allowNegative={false}
          allowLeadingZeros={false}
          decimalScale={2}
          hideControls
          defaultValue={offer.price}
          onChange={(value) => onChange({ price: toNumber(value) })}
        />
        <Textarea
          label="Notes"
          rows={2}
          resize="none"
          value={offer.notes}
          onChange={(event) => onChange({ notes: event.currentTarget.value })}
        />
        <Group justify="space-between" wrap="nowrap" mih={22}>
          <Text fw={700}>
            {unitPrice === null ? '—' : `${priceFormat.format(unitPrice)} / ${priceUnit}²`}
          </Text>
          {rank && !isBest && (
            <Text size="sm" c="dimmed">
              +{Math.max(1, Math.round(rank.percentAboveBest))}% vs best
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  )
}
