import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityInput } from './QuantityInput'
import { renderWithMantine } from '../test/render'

const field = (): HTMLInputElement =>
  screen.getByRole<HTMLInputElement>('textbox', { name: 'Quantity' })

describe('QuantityInput', () => {
  it('shows the quantity', () => {
    renderWithMantine(<QuantityInput value={2} onChange={vi.fn()} />)
    expect(field().value).toBe('2')
  })

  it('reports a new whole quantity', async () => {
    const onChange = vi.fn()
    renderWithMantine(<QuantityInput value={2} onChange={onChange} />)

    await userEvent.clear(field())
    await userEvent.type(field(), '3')

    expect(onChange).toHaveBeenLastCalledWith(3)
  })

  it('does not report an empty field', async () => {
    const onChange = vi.fn()
    renderWithMantine(<QuantityInput value={2} onChange={onChange} />)

    await userEvent.clear(field())

    expect(onChange).not.toHaveBeenCalled()
  })

  it('restores the last quantity when the field is left empty', async () => {
    renderWithMantine(<QuantityInput value={2} onChange={vi.fn()} />)

    await userEvent.clear(field())
    await userEvent.tab()

    expect(field().value).toBe('2')
  })

  it('does not accept zero', async () => {
    const onChange = vi.fn()
    renderWithMantine(<QuantityInput value={2} onChange={onChange} />)

    await userEvent.clear(field())
    await userEvent.type(field(), '0')
    await userEvent.tab()

    expect(onChange).not.toHaveBeenCalled()
    expect(field().value).toBe('2')
  })

  it('does not accept decimals', async () => {
    const onChange = vi.fn()
    renderWithMantine(<QuantityInput value={1} onChange={onChange} />)

    await userEvent.clear(field())
    await userEvent.type(field(), '2.5')

    expect(onChange).not.toHaveBeenCalledWith(2.5)
  })
})
