import { NumberInput } from '@mantine/core'
import { useState, type ReactElement } from 'react'

interface QuantityInputProps {
  value: number
  onChange: (quantity: number) => void
}

// A quantity is a whole number of at least 1. The field may be empty while typing, but that is
// never reported, and leaving it empty (or at 0) restores the last valid quantity.
export function QuantityInput({ value, onChange }: Readonly<QuantityInputProps>): ReactElement {
  const [text, setText] = useState<number | string>(value)

  function handleChange(next: number | string): void {
    setText(next)
    if (typeof next === 'number' && Number.isInteger(next) && next >= 1) onChange(next)
  }

  return (
    <NumberInput
      label="Quantity"
      leftSection={<span aria-hidden="true">×</span>}
      leftSectionPointerEvents="none"
      clampBehavior="none"
      allowNegative={false}
      allowDecimal={false}
      allowLeadingZeros={false}
      hideControls
      value={text}
      onChange={handleChange}
      onBlur={() => setText(value)}
      w={72}
    />
  )
}
