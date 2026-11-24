import { MantineProvider } from '@mantine/core'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'
import type { Offer, OfferRank } from '../lib/offer'
import type { Pizza } from '../lib/pizza'
import { OfferCard } from './OfferCard'
import { renderWithMantine } from '../test/render'

const pizza: Pizza = {
  id: 1,
  shape: 'round',
  diameter: 10,
  width: 12,
  length: 16,
  unit: 'in',
  quantity: 1,
}

const offer: Offer = { id: 1, name: 'Small', notes: '', price: 10, pizzas: [pizza] }

interface CardHandlers {
  onChange: Mock
  onPizzaChange: Mock
  onAddPizza: Mock
  onRemovePizza: Mock
  onRemove: Mock
}

function renderCard(
  pizzaOverrides: Partial<Pizza> = {},
  rank: OfferRank | null = null,
  offerOverrides: Partial<Offer> = {},
  showBundles = true,
): CardHandlers {
  const handlers = {
    onChange: vi.fn(),
    onPizzaChange: vi.fn(),
    onAddPizza: vi.fn(),
    onRemovePizza: vi.fn(),
    onRemove: vi.fn(),
  }
  renderWithMantine(
    <OfferCard
      offer={{ ...offer, pizzas: [{ ...pizza, ...pizzaOverrides }], ...offerOverrides }}
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
      showBundles={showBundles}
      {...handlers}
    />,
  )
  return handlers
}

describe('OfferCard', () => {
  it('hides the bundle controls when bundles are off', () => {
    renderCard({}, null, {}, false)

    expect(screen.queryByRole('button', { name: 'Add pizza' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove pizza' })).toBeNull()
    expect(screen.queryByRole('textbox', { name: 'Quantity' })).toBeNull()
    expect(screen.queryByText('What you pay for the whole offer.')).toBeNull()
    expect(screen.getByRole('combobox', { name: 'Shape' })).toBeTruthy()
  })

  it('shows the bundle controls when bundles are on', () => {
    renderCard()

    expect(screen.getByRole('button', { name: 'Add pizza' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeTruthy()
    expect(screen.getByText('What you pay for the whole offer.')).toBeTruthy()
  })

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
    const { onPizzaChange } = renderCard()
    await userEvent.selectOptions(screen.getByLabelText('Shape'), 'rectangular')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { shape: 'rectangular' })
  })

  it('reports width and length changes', async () => {
    const { onPizzaChange } = renderCard({ shape: 'rectangular' })

    const width = screen.getByRole('textbox', { name: 'Width' })
    await userEvent.clear(width)
    await userEvent.type(width, '9')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { width: 9 })

    const length = screen.getByRole('textbox', { name: 'Length' })
    await userEvent.clear(length)
    await userEvent.type(length, '14')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { length: 14 })
  })

  it('shows the price per area of a rectangular pizza', () => {
    renderCard({ shape: 'rectangular', width: 10, length: 10 })
    expect(screen.getByText('$0.1000 / in²')).toBeTruthy()
  })

  it('marks the first rank as best value', () => {
    renderCard({}, { rank: 1, percentAboveBest: 0 })
    expect(screen.getByText('Best value')).toBeTruthy()
    expect(screen.getByText('#1')).toBeTruthy()
    expect(screen.getByText('Rank')).toBeTruthy()
    expect(screen.queryByText(/vs best/)).toBeNull()
  })

  it('shows the rank and the gap to the best on other cards', () => {
    renderCard({}, { rank: 2, percentAboveBest: 22.6 })
    expect(screen.getByText('#2')).toBeTruthy()
    expect(screen.getByText('Rank')).toBeTruthy()
    expect(screen.getByText('+23% vs best')).toBeTruthy()
    expect(screen.queryByText('Best value')).toBeNull()
  })

  it('shows no rank when the offer is not ranked', () => {
    renderCard()
    expect(screen.queryByText('Rank')).toBeNull()
  })

  it('shows the price per area', () => {
    renderCard()
    expect(screen.getByText('$0.1273 / in²')).toBeTruthy()
  })

  it('shows a dash when the offer cannot be compared', () => {
    renderCard({ diameter: 0 })
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('labels the price with the currency', () => {
    renderCard()
    expect(screen.getByLabelText('Price (USD)')).toBeTruthy()
  })

  it('reports name, notes, unit, diameter, and price changes', async () => {
    const { onChange, onPizzaChange } = renderCard()

    await userEvent.type(screen.getByLabelText('Name'), '!')
    expect(onChange).toHaveBeenLastCalledWith({ name: 'Small!' })

    await userEvent.type(screen.getByLabelText('Notes'), 'x')
    expect(onChange).toHaveBeenLastCalledWith({ notes: 'x' })

    await userEvent.selectOptions(screen.getByLabelText('Size unit'), 'cm')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { unit: 'cm' })

    const diameter = screen.getByRole('textbox', { name: 'Diameter' })
    await userEvent.clear(diameter)
    await userEvent.type(diameter, '7')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { diameter: 7 })

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
    const { onPizzaChange } = renderCard()
    const diameter = screen.getByRole('textbox', { name: 'Diameter' })

    await userEvent.clear(diameter)
    await userEvent.type(diameter, '.')

    const reported = onPizzaChange.mock.calls.map(([, changes]) => changes.diameter)
    expect(reported.every((value) => Number.isFinite(value))).toBe(true)
  })

  it('shows the sizes of another pizza when the pizza changes', () => {
    const props = {
      currency: 'USD',
      priceUnit: 'in' as const,
      priceFormat: new Intl.NumberFormat('en-US'),
      rank: null,
      maxSizeInches: 16,
      showBundles: true,
      onChange: vi.fn(),
      onPizzaChange: vi.fn(),
      onAddPizza: vi.fn(),
      onRemovePizza: vi.fn(),
      onRemove: vi.fn(),
    }
    const { rerender } = renderWithMantine(<OfferCard offer={offer} {...props} />)
    const other = { ...offer, pizzas: [{ ...pizza, id: 2, diameter: 20 }] }

    rerender(
      <MantineProvider>
        <OfferCard offer={other} {...props} />
      </MantineProvider>,
    )

    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Diameter' }).value).toBe('20')
  })

  it('asks to remove the offer', async () => {
    const { onRemove } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Remove offer' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('shows the quantity and reports changes to it', async () => {
    const { onPizzaChange } = renderCard({ quantity: 2 })
    const quantity = screen.getByRole<HTMLInputElement>('textbox', { name: 'Quantity' })
    expect(quantity.value).toBe('2')

    await userEvent.clear(quantity)
    await userEvent.type(quantity, '3')
    expect(onPizzaChange).toHaveBeenLastCalledWith(1, { quantity: 3 })
  })

  it('says the price covers the whole offer', () => {
    renderCard()
    expect(screen.getByText('What you pay for the whole offer.')).toBeTruthy()
  })

  it('labels the price the same way whatever the quantity', () => {
    renderCard({ quantity: 3 })
    expect(screen.getByLabelText('Price (USD)')).toBeTruthy()
  })

  it('says which control to use for one pizza, several of the same, or a different one', () => {
    renderCard()
    expect(screen.getByText(/Just one pizza → nothing to do/)).toBeTruthy()
    expect(screen.getByText(/Same pizza, several of them → Quantity/)).toBeTruthy()
    expect(screen.getByText(/A different pizza in the deal → Add/)).toBeTruthy()
  })

  it('always offers to add a pizza to the offer', () => {
    renderCard()
    expect(screen.getByRole('button', { name: 'Add pizza' })).toBeTruthy()
  })

  it('asks to add a pizza to the offer', async () => {
    const { onAddPizza } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Add pizza' }))
    expect(onAddPizza).toHaveBeenCalledOnce()
  })

  it('cannot remove the only pizza of an offer', () => {
    renderCard()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Remove pizza' }).disabled).toBe(
      true,
    )
  })
})

describe('OfferCard with several pizzas', () => {
  const second: Pizza = { ...pizza, id: 2, diameter: 12 }

  function renderCombo(): CardHandlers {
    const handlers = {
      onChange: vi.fn(),
      onPizzaChange: vi.fn(),
      onAddPizza: vi.fn(),
      onRemovePizza: vi.fn(),
      onRemove: vi.fn(),
    }
    renderWithMantine(
      <OfferCard
        offer={{ ...offer, price: 25, pizzas: [{ ...pizza, diameter: 16 }, second] }}
        currency="USD"
        priceUnit="in"
        priceFormat={
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
          })
        }
        rank={null}
        maxSizeInches={16}
        showBundles
        {...handlers}
      />,
    )
    return handlers
  }

  it('offers to remove the pizza shown while the offer has several', () => {
    renderCombo()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Remove pizza' }).disabled).toBe(
      false,
    )
  })

  it('starts on the first pizza, and says which of how many', () => {
    renderCombo()
    expect(screen.getByText('Pizza 1 of 2')).toBeTruthy()
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Diameter' }).value).toBe('16')
    expect(screen.getByRole('img', { name: '16 in pizza' })).toBeTruthy()
  })

  it('shows only the selected pizza and its fields, and moves with the arrows', async () => {
    renderCombo()

    await userEvent.click(screen.getByRole('button', { name: 'Next pizza' }))

    expect(screen.getByText('Pizza 2 of 2')).toBeTruthy()
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img', { name: '12 in pizza' })).toBeTruthy()
    expect(screen.getAllByRole('textbox', { name: 'Diameter' })).toHaveLength(1)
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Diameter' }).value).toBe('12')
  })

  it('reports a change against the pizza that is selected', async () => {
    const { onPizzaChange } = renderCombo()
    await userEvent.click(screen.getByRole('button', { name: 'Next pizza' }))
    const diameter = screen.getByRole('textbox', { name: 'Diameter' })

    await userEvent.clear(diameter)
    await userEvent.type(diameter, '9')

    expect(onPizzaChange).toHaveBeenLastCalledWith(2, { diameter: 9 })
  })

  it('removes the selected pizza', async () => {
    const { onRemovePizza } = renderCombo()
    await userEvent.click(screen.getByRole('button', { name: 'Next pizza' }))

    await userEvent.click(screen.getByRole('button', { name: 'Remove pizza' }))

    expect(onRemovePizza).toHaveBeenCalledWith(2)
  })

  it('has no arrows or position for a single pizza', () => {
    renderCard()
    expect(screen.queryByRole('button', { name: 'Next pizza' })).toBeNull()
    expect(screen.queryByText(/Pizza \d of/)).toBeNull()
  })

  it('keeps one price for an offer with several pizzas', () => {
    renderCombo()
    expect(screen.getAllByLabelText('Price (USD)')).toHaveLength(1)
  })

  it('shows one price per area for the whole offer', () => {
    renderCombo()
    expect(screen.getAllByText(/ \/ in²$/)).toHaveLength(1)
    expect(screen.getByText('$0.0796 / in²')).toBeTruthy()
  })
})
