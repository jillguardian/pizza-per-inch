import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'
import type { Pizza, PizzaRank } from '../lib/pizza'
import { PizzaCard } from './PizzaCard'
import { renderWithMantine } from '../test/render'

const pizza: Pizza = {
  id: 1,
  name: 'Small',
  notes: '',
  shape: 'round',
  diameter: 10,
  width: 12,
  length: 16,
  unit: 'in',
  price: 10,
}

interface CardHandlers {
  onChange: Mock
  onRemove: Mock
}

function renderCard(overrides: Partial<Pizza> = {}, rank: PizzaRank | null = null): CardHandlers {
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
      rank={rank}
      maxSizeInches={16}
      {...handlers}
    />,
  )
  return handlers
}

describe('PizzaCard', () => {
  it('asks for a diameter on a round pizza', () => {
    renderCard()
    expect(screen.getByRole('textbox', { name: 'Diameter' })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Width' })).toBeNull()
  })

  it('asks for a width and length on a rectangular pizza', () => {
    renderCard({ shape: 'rectangular' })
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Width' }).value).toBe('12')
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Length' }).value).toBe('16')
    expect(screen.queryByRole('textbox', { name: 'Diameter' })).toBeNull()
  })

  it('reports the chosen shape', async () => {
    const { onChange } = renderCard()
    await userEvent.selectOptions(screen.getByLabelText('Shape'), 'rectangular')
    expect(onChange).toHaveBeenLastCalledWith({ shape: 'rectangular' })
  })

  it('reports width and length changes', async () => {
    const { onChange } = renderCard({ shape: 'rectangular' })

    const width = screen.getByRole('textbox', { name: 'Width' })
    await userEvent.clear(width)
    await userEvent.type(width, '9')
    expect(onChange).toHaveBeenLastCalledWith({ width: 9 })

    const length = screen.getByRole('textbox', { name: 'Length' })
    await userEvent.clear(length)
    await userEvent.type(length, '14')
    expect(onChange).toHaveBeenLastCalledWith({ length: 14 })
  })

  it('shows the price per area of a rectangular pizza', () => {
    renderCard({ shape: 'rectangular', width: 10, length: 10 })
    expect(screen.getByText('$0.1000 / in²')).toBeTruthy()
  })

  it('marks the first rank as best value', () => {
    renderCard({}, { rank: 1, percentAboveBest: 0 })
    expect(screen.getByText('#1 Best value')).toBeTruthy()
    expect(screen.queryByText(/vs best/)).toBeNull()
  })

  it('shows the rank and the gap to the best on other cards', () => {
    renderCard({}, { rank: 2, percentAboveBest: 22.6 })
    expect(screen.getByText('#2')).toBeTruthy()
    expect(screen.getByText('+23% vs best')).toBeTruthy()
  })

  it('shows no rank when the pizza is not ranked', () => {
    renderCard()
    expect(screen.queryByText(/#\d/)).toBeNull()
  })

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

    await userEvent.selectOptions(screen.getByLabelText('Size unit'), 'cm')
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

  it('shows the current diameter and price', () => {
    renderCard()
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Diameter' }).value).toBe('10')
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Price (USD)' }).value).toBe('10')
  })

  it('reports decimals and treats a cleared field as zero', async () => {
    const { onChange } = renderCard()
    const price = screen.getByRole('textbox', { name: 'Price (USD)' })

    await userEvent.clear(price)
    expect(onChange).toHaveBeenLastCalledWith({ price: 0 })

    await userEvent.type(price, '7.5')
    expect(onChange).toHaveBeenLastCalledWith({ price: 7.5 })
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
