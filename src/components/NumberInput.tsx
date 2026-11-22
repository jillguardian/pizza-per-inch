import { useState, type ChangeEvent, type ReactElement } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  step?: string
}

// Keeps the typed text separately so clearing the field doesn't leave a stray "0" to type after.
export function NumberInput({ value, onChange, step }: Readonly<NumberInputProps>): ReactElement {
  const [draft, setDraft] = useState(String(value))

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setDraft(event.target.value)
    onChange(Number(event.target.value))
  }

  function handleBlur(): void {
    setDraft(String(value))
  }

  return (
    <input
      type="number"
      min="0"
      step={step}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
