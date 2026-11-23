import {
  Badge,
  Button,
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
import { convertLength, pricePerSquareUnit, type Pizza, type SizeUnit } from '../lib/pizza'
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

const SIZE_UNIT_OPTIONS = ['in', 'cm']

// The number fields are uncontrolled (defaultValue) so Mantine owns the typed text,
// including partial input like "0." and cleared fields.
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
    <Card
      component="section"
      withBorder
      padding="md"
      radius="md"
      className={isBest ? 'pizza best' : 'pizza'}
    >
      <Stack gap="xs">
        <div className="visual">
          <PizzaVisual
            diameter={convertLength(pizza.diameter, pizza.unit, 'in')}
            maxDiameter={maxDiameterInches}
            label={`${pizza.diameter} ${pizza.unit} pizza`}
          />
        </div>
        <TextInput
          aria-label="Name"
          value={pizza.name}
          onChange={(event) => onChange({ name: event.currentTarget.value })}
        />
        <Group gap="xs" align="flex-end" wrap="nowrap">
          <NumberInput
            label="Diameter"
            min={0}
            allowNegative={false}
            allowLeadingZeros={false}
            hideControls
            defaultValue={pizza.diameter}
            onChange={(value) => onChange({ diameter: Number(value) })}
            style={{ flex: 1 }}
          />
          <NativeSelect
            aria-label="Diameter unit"
            data={SIZE_UNIT_OPTIONS}
            value={pizza.unit}
            onChange={(event) => onChange({ unit: event.currentTarget.value as SizeUnit })}
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
          defaultValue={pizza.price}
          onChange={(value) => onChange({ price: Number(value) })}
        />
        <Textarea
          label="Notes"
          rows={2}
          value={pizza.notes}
          onChange={(event) => onChange({ notes: event.currentTarget.value })}
        />
        <Text fw={700}>
          {unitPrice === null ? '—' : `${priceFormat.format(unitPrice)} / ${priceUnit}²`}
        </Text>
        <Badge color="green" w="fit-content" className={isBest ? undefined : 'reserved'}>
          Best value
        </Badge>
        <Button variant="light" color="red" onClick={onRemove}>
          Remove
        </Button>
      </Stack>
    </Card>
  )
}
