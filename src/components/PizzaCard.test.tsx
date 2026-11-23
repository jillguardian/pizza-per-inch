import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'
import type { Pizza } from '../lib/pizza'
import { PizzaCard } from './PizzaCard'
import { renderWithMantine } from '../test/render'

const pizza: Pizza = { id: 1, name: 'Small', notes: '', diameter: 10, unit: 'in', price: 10 }

interface CardHandlers {
  onChange: Mock
  onRemove: Mock
}

function renderCard(overrides: Partial<Pizza> = {}): CardHandlers {
  const handlers = { onChange: vi.fn(), onRemove: vi.fn() }
  renderWithMantine(
    <PizzaCard
      pizza={{ ...pizza, ...overrides }}
      currency="USD"
      priceUnit="in"
      priceFormat={
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 4,
        })
      }
      isBest={false}
      maxDiameterInches={16}
      {...handlers}
    />,
  )
  return handlers
}

describe('PizzaCard', () => {
  it('shows the price per area', () => {
    renderCard()
    expect(screen.getByText('$0.1273 / in²')).toBeTruthy()
  })

  it('shows a dash when the pizza cannot be compared', () => {
    renderCard({ diameter: 0 })
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('labels the price with the currency', () => {
    renderCard()
    expect(screen.getByLabelText('Price (USD)')).toBeTruthy()
  })

  it('reports name, notes, unit, diameter, and price changes', async () => {
    const { onChange } = renderCard()

    await userEvent.type(screen.getByLabelText('Name'), '!')
    expect(onChange).toHaveBeenLastCalledWith({ name: 'Small!' })

    await userEvent.type(screen.getByLabelText('Notes'), 'x')
    expect(onChange).toHaveBeenLastCalledWith({ notes: 'x' })

    await userEvent.selectOptions(screen.getByLabelText('Diameter unit'), 'cm')
    expect(onChange).toHaveBeenLastCalledWith({ unit: 'cm' })

    const diameter = screen.getByRole('textbox', { name: 'Diameter' })
    await userEvent.clear(diameter)
    await userEvent.type(diameter, '7')
    expect(onChange).toHaveBeenLastCalledWith({ diameter: 7 })

    const price = screen.getByLabelText('Price (USD)')
    await userEvent.clear(price)
    await userEvent.type(price, '8')
    expect(onChange).toHaveBeenLastCalledWith({ price: 8 })
  })

  it('does not leave a leading zero after clearing a number field', async () => {
    renderCard()
    const diameter = screen.getByRole<HTMLInputElement>('textbox', { name: 'Diameter' })

    await userEvent.clear(diameter)
    await userEvent.type(diameter, '05')

    expect(diameter.value).toBe('5')
  })

  it('never reports NaN for partial input', async () => {
    const { onChange } = renderCard()
    const diameter = screen.getByRole('textbox', { name: 'Diameter' })

    await userEvent.clear(diameter)
    await userEvent.type(diameter, '.')

    const reported = onChange.mock.calls.map(([changes]) => changes.diameter)
    expect(reported.every((value) => Number.isFinite(value))).toBe(true)
  })

  it('asks to be removed', async () => {
    const { onRemove } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
