import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'
import { Toolbar } from './Toolbar'
import { renderWithMantine } from '../test/render'

interface ToolbarHandlers {
  onCurrencyChange: Mock
  onPriceUnitChange: Mock
  onAddOffer: Mock
  onBundlesChange: Mock
}

function renderToolbar(overrides: Partial<Parameters<typeof Toolbar>[0]> = {}): ToolbarHandlers {
  const handlers = {
    onCurrencyChange: vi.fn(),
    onPriceUnitChange: vi.fn(),
    onAddOffer: vi.fn(),
    onBundlesChange: vi.fn(),
  }
  renderWithMantine(
    <Toolbar
      currency="USD"
      priceUnit="in"
      showBundles={false}
      bundlesLocked={false}
      {...handlers}
      {...overrides}
    />,
  )
  return handlers
}

describe('Toolbar', () => {
  it('asks to add an offer', async () => {
    const { onAddOffer } = renderToolbar()
    await userEvent.click(screen.getByRole('button', { name: '+ Add offer' }))
    expect(onAddOffer).toHaveBeenCalledOnce()
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
  })
})
