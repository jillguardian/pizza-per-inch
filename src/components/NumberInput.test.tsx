import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './NumberInput'

function StatefulNumberInput({ initial }: Readonly<{ initial: number }>): ReactElement {
  const [value, setValue] = useState(initial)
  return <NumberInput value={value} onChange={setValue} />
}

describe('NumberInput', () => {
  it('shows the current value', () => {
    render(<NumberInput value={12} onChange={vi.fn()} />)
    expect(screen.getByRole<HTMLInputElement>('spinbutton').value).toBe('12')
  })

  it('reports typed numbers', async () => {
    const onChange = vi.fn()
    render(<NumberInput value={12} onChange={onChange} />)

    await userEvent.type(screen.getByRole('spinbutton'), '5')

    expect(onChange).toHaveBeenLastCalledWith(125)
  })

  it('does not leave a leading zero after clearing the field', async () => {
    render(<StatefulNumberInput initial={12} />)
    const input = screen.getByRole<HTMLInputElement>('spinbutton')

    await userEvent.clear(input)
    await userEvent.type(input, '5')

    expect(input.value).toBe('5')
  })

  it('cleans up typed zeros when the field loses focus', async () => {
    render(<StatefulNumberInput initial={12} />)
    const input = screen.getByRole<HTMLInputElement>('spinbutton')

    await userEvent.clear(input)
    await userEvent.type(input, '05')
    await userEvent.tab()

    expect(input.value).toBe('5')
  })
})
