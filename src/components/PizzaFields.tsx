import { Button, Group, NativeSelect, NumberInput, Stack, Text } from '@mantine/core'
import { useRef, type ReactElement } from 'react'
import type { Pizza, PizzaShape, SizeUnit } from '../lib/pizza'
import { CloseIcon } from './CloseIcon'
import { PlusIcon } from './PlusIcon'
import { QuantityInput } from './QuantityInput'
import { toNumber } from './toNumber'

interface PizzaFieldsProps {
  pizza: Pizza
  index: number
  count: number
  showBundles: boolean
  onChange: (changes: Partial<Pizza>) => void
  onAdd: () => void
  onRemove: () => void
}

const SIZE_UNIT_OPTIONS = ['in', 'cm']
const SHAPE_OPTIONS = [
  { value: 'round', label: 'Round' },
  { value: 'rectangular', label: 'Rectangle' },
]

// The number fields are uncontrolled (defaultValue) so Mantine owns the typed text,
// including partial input like "0." and cleared fields. They are keyed by pizza, so showing
// another pizza starts them afresh. The buttons are not, so they keep keyboard focus.
export function PizzaFields({
  pizza,
  index,
  count,
  showBundles,
  onChange,
  onAdd,
  onRemove,
}: Readonly<PizzaFieldsProps>): ReactElement {
  const addButton = useRef<HTMLButtonElement>(null)

  // Remove is disabled once one pizza is left, and a disabled button cannot keep focus.
  function handleRemove(): void {
    if (count === 2) addButton.current?.focus()
    onRemove()
  }

  return (
    <Stack
      component="fieldset"
      gap="xs"
      aria-label={`Pizza ${index + 1}`}
      style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
    >
      {showBundles && (
        <div>
          <Text size="sm" fw={500} mb={4}>
            {count > 1 ? `Pizza ${index + 1} of ${count}` : `Pizza ${index + 1}`}
          </Text>
          <Text size="xs" c="dimmed" mb={6}>
            Just one pizza → nothing to do
            <br />
            Same pizza, several of them → Quantity
            <br />A different pizza in the deal → Add
          </Text>
          <Button.Group className="pizza-actions">
            <Button
              ref={addButton}
              variant="default"
              size="sm"
              leftSection={<PlusIcon />}
              aria-label="Add pizza"
              style={{ flex: 1 }}
              onClick={onAdd}
            >
              Add
            </Button>
            <Button
              variant="default"
              size="sm"
              leftSection={<CloseIcon />}
              aria-label="Remove pizza"
              style={{ flex: 1 }}
              disabled={count === 1}
              onClick={handleRemove}
            >
              Remove
            </Button>
          </Button.Group>
        </div>
      )}
      <Group gap="xs" align="flex-end" wrap="nowrap">
        <NativeSelect
          label="Shape"
          data={SHAPE_OPTIONS}
          value={pizza.shape}
          onChange={(event) => onChange({ shape: event.currentTarget.value as PizzaShape })}
          style={{ flex: 1 }}
        />
        {showBundles && (
          <QuantityInput
            key={pizza.id}
            value={pizza.quantity}
            onChange={(quantity) => onChange({ quantity })}
          />
        )}
      </Group>
      <Group gap="xs" align="flex-end" wrap="nowrap">
        {pizza.shape === 'round' ? (
          <NumberInput
            key={pizza.id}
            label="Diameter"
            min={0}
            allowNegative={false}
            allowLeadingZeros={false}
            hideControls
            defaultValue={pizza.diameter}
            onChange={(value) => onChange({ diameter: toNumber(value) })}
            style={{ flex: 1, minWidth: 0 }}
          />
        ) : (
          <>
            <NumberInput
              key={`${pizza.id}-width`}
              label="Width"
              min={0}
              allowNegative={false}
              allowLeadingZeros={false}
              hideControls
              defaultValue={pizza.width}
              onChange={(value) => onChange({ width: toNumber(value) })}
              style={{ flex: 1, minWidth: 0 }}
            />
            <NumberInput
              key={`${pizza.id}-length`}
              label="Length"
              min={0}
              allowNegative={false}
              allowLeadingZeros={false}
              hideControls
              defaultValue={pizza.length}
              onChange={(value) => onChange({ length: toNumber(value) })}
              style={{ flex: 1, minWidth: 0 }}
            />
          </>
        )}
        <NativeSelect
          aria-label="Size unit"
          data={SIZE_UNIT_OPTIONS}
          value={pizza.unit}
          onChange={(event) => onChange({ unit: event.currentTarget.value as SizeUnit })}
          w={72}
        />
      </Group>
    </Stack>
  )
}
