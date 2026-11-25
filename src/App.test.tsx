import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { renderWithMantine } from './test/render'

describe('App', () => {
  it('explains that a card is one offer, a single pizza or a bundle', () => {
    renderWithMantine(<App />)
    expect(
      screen.getByText('Each card is one offer: a single pizza or a bundle, with one price.'),
    ).toBeTruthy()
  })

  it('starts with two offers to compare', () => {
    renderWithMantine(<App />)
    expect(screen.getAllByLabelText('Name')).toHaveLength(2)
  })

  it('adds and removes offers', async () => {
    renderWithMantine(<App />)

    await userEvent.click(screen.getByRole('button', { name: '+ Add offer' }))
    expect(screen.getAllByLabelText('Name')).toHaveLength(3)

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[0])
    expect(screen.getAllByLabelText('Name')).toHaveLength(2)
  })

  it('applies the chosen currency to every offer', async () => {
    renderWithMantine(<App />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'EUR')

    expect(screen.getAllByLabelText('Price (EUR)')).toHaveLength(2)
  })

  it('shows prices in the chosen area unit', async () => {
    renderWithMantine(<App />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show price per' }), 'cm')

    expect(screen.getAllByText(/ \/ cm²$/)).toHaveLength(2)
  })

  it('adds a pizza to an offer and selects it', async () => {
    renderWithMantine(<App />)
    const offer = screen.getAllByLabelText<HTMLInputElement>('Name')[0].closest('section')
    if (!offer) throw new Error('Expected the offer card')
    expect(within(offer).getByText('$0.1146 / in²')).toBeTruthy()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))
    await userEvent.click(within(offer).getByRole('button', { name: 'Add pizza' }))

    expect(within(offer).getByText('Pizza 2 of 2')).toBeTruthy()
    expect(within(offer).getByText(/ \/ in²$/).textContent).not.toBe('$0.1146 / in²')
  })

  it('keeps the last pizza and goes back to a single pizza when one is removed', async () => {
    renderWithMantine(<App />)
    const offer = screen.getAllByLabelText<HTMLInputElement>('Name')[0].closest('section')
    if (!offer) throw new Error('Expected the offer card')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))
    await userEvent.click(within(offer).getByRole('button', { name: 'Add pizza' }))

    await userEvent.click(within(offer).getByRole('button', { name: 'Remove pizza' }))

    expect(within(offer).queryByRole('button', { name: 'Next pizza' })).toBeNull()
    expect(within(offer).getByText('$0.1146 / in²')).toBeTruthy()
  })

  it('hides bundle controls until the checkbox is ticked', async () => {
    renderWithMantine(<App />)
    expect(screen.queryByRole('button', { name: 'Add pizza' })).toBeNull()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))

    expect(screen.getAllByRole('button', { name: 'Add pizza' })).toHaveLength(2)
  })

  it('keeps bundles on while an offer is a bundle', async () => {
    renderWithMantine(<App />)
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Multi-pizza deals' })
    await userEvent.click(checkbox)
    await userEvent.click(screen.getAllByRole('button', { name: 'Add pizza' })[0])

    expect(checkbox.disabled).toBe(true)
    expect(checkbox.checked).toBe(true)
  })

  describe('sorting', () => {
    const names = (): string[] =>
      screen.getAllByLabelText<HTMLInputElement>('Name').map((input) => input.value)

    it('puts the best value first when asked', async () => {
      renderWithMantine(<App />)
      expect(names()).toEqual(['Small', 'Large'])

      await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))

      expect(names()).toEqual(['Large', 'Small'])
    })

    it('does not reorder cards while the user is typing', async () => {
      renderWithMantine(<App />)
      const smallPrice = screen.getAllByRole('textbox', { name: /Price/ })[0]

      await userEvent.clear(smallPrice)
      await userEvent.type(smallPrice, '100')

      expect(names()).toEqual(['Small', 'Large'])
    })
  })
})
