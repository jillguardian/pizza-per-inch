import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { detectLocaleCurrency } from './lib/currencies'
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

    await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
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

    it('sorts again by the latest prices on the next click', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))
      expect(names()).toEqual(['Large', 'Small'])

      const largePrice = screen.getAllByRole('textbox', { name: /Price/ })[0]
      await userEvent.clear(largePrice)
      await userEvent.type(largePrice, '100')
      expect(names()).toEqual(['Large', 'Small'])

      await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))
      expect(names()).toEqual(['Small', 'Large'])
    })
  })

  describe('keyboard focus', () => {
    const addPizza = (): HTMLElement => screen.getAllByRole('button', { name: 'Add pizza' })[0]
    const removePizza = (): HTMLElement =>
      screen.getAllByRole('button', { name: 'Remove pizza' })[0]

    async function showBundleControls(): Promise<void> {
      await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))
    }

    it('stays on Add pizza after adding a pizza', async () => {
      renderWithMantine(<App />)
      await showBundleControls()

      await userEvent.click(addPizza())

      expect(document.activeElement).toBe(addPizza())
    })

    it('stays on Remove pizza while more than one pizza is left', async () => {
      renderWithMantine(<App />)
      await showBundleControls()
      await userEvent.click(addPizza())
      await userEvent.click(addPizza())

      await userEvent.click(removePizza())

      expect(document.activeElement).toBe(removePizza())
    })

    it('moves to Add pizza when the removal leaves one pizza, as Remove pizza is then disabled', async () => {
      renderWithMantine(<App />)
      await showBundleControls()
      await userEvent.click(addPizza())

      await userEvent.click(removePizza())

      expect(document.activeElement).toBe(addPizza())
    })

    it('moves to the name of the next offer after removing an offer', async () => {
      renderWithMantine(<App />)

      await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[0])

      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }))
      expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' }).value).toBe('Large')
    })

    it('moves to the name of the previous offer after removing the last offer', async () => {
      renderWithMantine(<App />)

      await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[1])

      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }))
      expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' }).value).toBe('Small')
    })

    it('moves to Add offer after removing the only offer', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[0])

      await userEvent.click(screen.getByRole('button', { name: 'Remove offer' }))

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add offer' }))
    })
  })

  describe('announcements for screen readers', () => {
    const status = (): string => screen.getByRole('status').textContent.trim()

    it('has a quiet status region to start with', () => {
      renderWithMantine(<App />)
      expect(status()).toBe('')
    })

    it('announces an added offer', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
      expect(status()).toBe('Offer added. 3 offers.')
    })

    it('announces a removed offer', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[0])
      expect(status()).toBe('Small removed. 1 offer left.')
    })

    it('announces the order after sorting', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))
      expect(status()).toBe('Sorted by value, best first: Large, Small.')
    })

    it('says when there is nothing to sort', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getAllByRole('button', { name: 'Remove offer' })[0])

      await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))

      expect(status()).toContain('Nothing to sort yet')
    })

    it('announces an added and a removed pizza', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))

      await userEvent.click(screen.getAllByRole('button', { name: 'Add pizza' })[0])
      expect(status()).toBe('Pizza 2 of 2 added to Small.')

      await userEvent.click(screen.getAllByRole('button', { name: 'Remove pizza' })[0])
      expect(status()).toBe('Pizza removed from Small. 1 pizza left.')
    })

    it('announces a new best value only after typing pauses', async () => {
      renderWithMantine(<App />)
      const smallPrice = screen.getAllByRole('textbox', { name: /Price/ })[0]

      await userEvent.clear(smallPrice)
      await userEvent.type(smallPrice, '1')
      expect(status()).toBe('')

      await waitFor(() => expect(status()).toBe('Small is now the best value.'), {
        timeout: 3000,
      })
    })
  })

  describe('remembering the comparison', () => {
    const KEY = 'pizza-per-inch:comparison'
    const savedText = JSON.stringify({
      version: 1,
      offers: [
        {
          id: 4,
          name: 'Friday special',
          notes: '',
          price: 21,
          pizzas: [
            { id: 6, shape: 'round', diameter: 15, width: 12, length: 16, unit: 'in', quantity: 1 },
          ],
        },
      ],
      currency: 'EUR',
      priceUnit: 'cm',
      bundlesChosen: true,
    })

    it('starts from the saved comparison', () => {
      localStorage.setItem(KEY, savedText)
      renderWithMantine(<App />)

      expect(screen.getAllByLabelText('Name')).toHaveLength(1)
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Friday special')
      expect((screen.getByRole('combobox', { name: 'Currency' }) as HTMLSelectElement).value).toBe(
        'EUR',
      )
      expect(screen.getByLabelText('Price (EUR)')).toBeTruthy()
      expect(screen.getByRole('checkbox', { name: 'Multi-pizza deals' })).toHaveProperty(
        'checked',
        true,
      )
    })

    it('carries on from the saved ids, so a new offer does not reuse one', async () => {
      localStorage.setItem(KEY, savedText)
      renderWithMantine(<App />)

      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))

      expect((screen.getAllByLabelText('Name')[1] as HTMLInputElement).value).toBe('Offer 5')
    })

    it('saves what is changed, so a reload gets it back', async () => {
      const first = renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'GBP')
      first.unmount()

      renderWithMantine(<App />)

      expect(screen.getAllByLabelText('Name')).toHaveLength(3)
      expect(screen.getAllByLabelText('Price (GBP)')).toHaveLength(3)
    })

    it('remembers an edited name', async () => {
      const first = renderWithMantine(<App />)
      const name = screen.getAllByLabelText('Name')[0]
      await userEvent.clear(name)
      await userEvent.type(name, 'Corner shop')
      first.unmount()

      renderWithMantine(<App />)

      expect((screen.getAllByLabelText('Name')[0] as HTMLInputElement).value).toBe('Corner shop')
    })

    it('resets: the examples, the default currency and unit, and the saved copy follows', async () => {
      const first = renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'GBP')
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show price per' }), 'cm')
      await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))
      expect(screen.getAllByLabelText('Name')).toHaveLength(3)

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      const dialog = await screen.findByRole('dialog', { name: 'Reset the comparison?' })
      await userEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))

      await waitFor(() => expect(screen.getAllByLabelText('Name')).toHaveLength(2))
      expect((screen.getAllByLabelText('Name')[0] as HTMLInputElement).value).toBe('Small')
      expect(
        (screen.getByRole('combobox', { name: 'Show price per' }) as HTMLSelectElement).value,
      ).toBe('in')
      expect((screen.getByRole('combobox', { name: 'Currency' }) as HTMLSelectElement).value).toBe(
        detectLocaleCurrency() ?? 'USD',
      )
      expect(screen.getByRole('checkbox', { name: 'Multi-pizza deals' })).toHaveProperty(
        'checked',
        false,
      )
      expect(screen.getByRole('status').textContent).toBe('Comparison reset to 2 example offers.')

      first.unmount()
      renderWithMantine(<App />)
      expect(screen.getAllByLabelText('Name')).toHaveLength(2)
    })

    it('keeps the comparison when the reset is cancelled', async () => {
      renderWithMantine(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      const dialog = await screen.findByRole('dialog')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(screen.getAllByLabelText('Name')).toHaveLength(3)
    })

    it('starts with the example offers when the saved data is damaged', () => {
      localStorage.setItem(KEY, '{"version": 1, "offers": "oops"')
      renderWithMantine(<App />)

      expect(screen.getAllByLabelText('Name')).toHaveLength(2)
    })

    it('still works, with the examples, when storage is blocked', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage is blocked')
      })
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage is blocked')
      })
      renderWithMantine(<App />)

      expect(screen.getAllByLabelText('Name')).toHaveLength(2)
      await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
      expect(screen.getAllByLabelText('Name')).toHaveLength(3)
      vi.restoreAllMocks()
    })
  })
})
