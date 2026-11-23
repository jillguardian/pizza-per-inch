import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'
import { createPizza, type Pizza } from '../lib/pizza'
import { OfferVisual } from './OfferVisual'
import { renderWithMantine } from '../test/render'

const width = (name: string): number =>
  Number(screen.getByRole('img', { name }).getAttribute('width'))

function renderVisual(pizza: Pizza, index = 0, count = 1): { onSelect: Mock } {
  const onSelect = vi.fn()
  renderWithMantine(
    <OfferVisual
      pizza={pizza}
      maxSizeInches={16}
      index={index}
      count={count}
      onSelect={onSelect}
    />,
  )
  return { onSelect }
}

describe('OfferVisual', () => {
  it('draws the pizza it is given', () => {
    renderVisual(createPizza(1, 16))
    expect(screen.getByRole('img', { name: '16 in pizza' })).toBeTruthy()
  })

  it('draws a rectangular pizza with its own description', () => {
    renderVisual({ ...createPizza(1), shape: 'rectangular', width: 12, length: 18 })
    expect(screen.getByRole('img', { name: '12 × 18 in rectangular pizza' })).toBeTruthy()
  })

  it('draws at one scale, so a smaller pizza looks smaller than a larger one', () => {
    const { unmount } = renderWithMantine(
      <OfferVisual
        pizza={createPizza(1, 16)}
        maxSizeInches={16}
        index={0}
        count={1}
        onSelect={vi.fn()}
      />,
    )
    const large = width('16 in pizza')
    unmount()

    renderVisual(createPizza(1, 8))

    expect(width('8 in pizza')).toBe(large / 2)
  })

  it('has no arrows for a single pizza', () => {
    renderVisual(createPizza(1, 16))
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('moves to the next and previous pizza', async () => {
    const { onSelect } = renderVisual(createPizza(2, 12), 1, 3)

    await userEvent.click(screen.getByRole('button', { name: 'Next pizza' }))
    expect(onSelect).toHaveBeenLastCalledWith(2)

    await userEvent.click(screen.getByRole('button', { name: 'Previous pizza' }))
    expect(onSelect).toHaveBeenLastCalledWith(0)
  })

  it('cannot go before the first or after the last pizza', () => {
    renderVisual(createPizza(1, 12), 0, 2)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous pizza' }).disabled).toBe(
      true,
    )
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next pizza' }).disabled).toBe(
      false,
    )
  })

  it('disables the next arrow on the last pizza', () => {
    renderVisual(createPizza(2, 12), 1, 2)
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next pizza' }).disabled).toBe(
      true,
    )
  })
})
