import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { Toolbar } from './Toolbar'
import { renderWithMantine } from '../test/render'
import { PHONE_QUERY } from './breakpoints'

interface ToolbarHandlers {
  onCurrencyChange: Mock
  onPriceUnitChange: Mock
  onAddOffer: Mock
  onSortOffers: Mock
  onClear: Mock
  onBundlesChange: Mock
}

function renderToolbar(overrides: Partial<Parameters<typeof Toolbar>[0]> = {}): ToolbarHandlers {
  const handlers = {
    onCurrencyChange: vi.fn(),
    onPriceUnitChange: vi.fn(),
    onAddOffer: vi.fn(),
    onSortOffers: vi.fn(),
    onClear: vi.fn(),
    onBundlesChange: vi.fn(),
  }
  renderWithMantine(
    <Toolbar
      currency="USD"
      priceUnit="in"
      showBundles={false}
      bundlesLocked={false}
      offerCount={2}
      {...handlers}
      {...overrides}
    />,
  )
  return handlers
}

// The stylesheet as text (a plain `?raw` import of a .css file comes back empty in Vitest).
const toolbarCss = Object.values(
  import.meta.glob('./Toolbar.css', { query: '?raw', import: 'default', eager: true }) as Record<
    string,
    string
  >,
)[0]

describe('Toolbar', () => {
  it('asks to add an offer', async () => {
    const { onAddOffer } = renderToolbar()
    await userEvent.click(screen.getByRole('button', { name: 'Add offer' }))
    expect(onAddOffer).toHaveBeenCalledOnce()
  })

  it('asks to sort the offers', async () => {
    const { onSortOffers } = renderToolbar()
    await userEvent.click(screen.getByRole('button', { name: 'Sort by value' }))
    expect(onSortOffers).toHaveBeenCalledOnce()
  })

  it('clears only after the dialog is confirmed', async () => {
    const { onClear } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).not.toHaveBeenCalled()
    const dialog = await screen.findByRole('dialog', { name: 'Clear all 2 offers?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }))

    expect(onClear).toHaveBeenCalledOnce()
  })

  it('does not repeat the visible button names as tooltips', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'Sort by value' }).getAttribute('title')).toBeNull()
    expect(screen.getByRole('button', { name: 'Clear' }).getAttribute('title')).toBeNull()
  })

  it('stays in step with the breakpoint in Toolbar.css, where the labels are hidden on a phone', () => {
    expect(toolbarCss.length).toBeGreaterThan(0)
    expect(toolbarCss).toContain(`@media ${PHONE_QUERY}`)
  })

  it('has one Clear button, so there is never a second one hidden in the page', () => {
    renderToolbar()
    expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(1)
  })

  it('reports a newly selected currency', async () => {
    const { onCurrencyChange } = renderToolbar()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'EUR')
    expect(onCurrencyChange).toHaveBeenCalledWith('EUR')
  })

  it('reports a newly selected price unit', async () => {
    const { onPriceUnitChange } = renderToolbar()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show price per' }), 'cm')
    expect(onPriceUnitChange).toHaveBeenCalledWith('cm')
  })

  it('shows the selected currency and unit', () => {
    renderToolbar({ currency: 'GBP', priceUnit: 'cm' })
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Currency' }).value).toBe('GBP')
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Show price per' }).value).toBe(
      'cm',
    )
  })

  it('reports turning bundles on', async () => {
    const { onBundlesChange } = renderToolbar()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Multi-pizza deals' }))
    expect(onBundlesChange).toHaveBeenCalledWith(true)
  })

  it('keeps bundles on and locked while an offer needs them', () => {
    renderToolbar({ showBundles: true, bundlesLocked: true })
    const checkbox = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Multi-pizza deals' })
    expect(checkbox.checked).toBe(true)
    expect(checkbox.disabled).toBe(true)
    expect(screen.getByText('An offer has several pizzas.')).toBeTruthy()
  })

  it('gives no lock explanation while the checkbox is free', () => {
    renderToolbar()
    expect(screen.queryByText('An offer has several pizzas.')).toBeNull()
  })

  it('tabs through the controls in the order they appear on screen', async () => {
    renderToolbar()
    const order = [
      screen.getByRole('combobox', { name: 'Currency' }),
      screen.getByRole('combobox', { name: 'Show price per' }),
      screen.getByRole('button', { name: 'Clear' }),
      screen.getByRole('button', { name: 'Add offer' }),
      screen.getByRole('button', { name: 'Sort by value' }),
      screen.getByRole('checkbox', { name: 'Multi-pizza deals' }),
    ]

    for (const control of order) {
      await userEvent.tab()
      expect(document.activeElement).toBe(control)
    }
  })

  describe('on a phone', () => {
    const realMatchMedia = window.matchMedia

    afterEach(() => {
      window.matchMedia = realMatchMedia
    })

    it('puts Clear among the pinned buttons, after Sort by value, and still has only one', async () => {
      window.matchMedia = ((query: string) => ({
        matches: query.includes('max-width'),
        media: query,
        addEventListener: (): void => {},
        removeEventListener: (): void => {},
      })) as unknown as typeof window.matchMedia
      renderToolbar()

      expect(screen.getAllByRole('button', { name: 'Clear' })).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Sort by value' }).getAttribute('title')).toBe(
        'Sort by value',
      )
      expect(screen.getByRole('button', { name: 'Clear' }).getAttribute('title')).toBe('Clear')
      const order = [
        screen.getByRole('combobox', { name: 'Currency' }),
        screen.getByRole('combobox', { name: 'Show price per' }),
        screen.getByRole('button', { name: 'Add offer' }),
        screen.getByRole('button', { name: 'Sort by value' }),
        screen.getByRole('button', { name: 'Clear' }),
        screen.getByRole('checkbox', { name: 'Multi-pizza deals' }),
      ]
      for (const control of order) {
        await userEvent.tab()
        expect(document.activeElement).toBe(control)
      }
    })
  })
})
