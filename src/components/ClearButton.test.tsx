import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithMantine } from '../test/render'
import { ClearButton } from './ClearButton'

describe('ClearButton', () => {
  it('does nothing until it is confirmed, and says what it removes', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ClearButton offerCount={3} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(await screen.findByRole('dialog', { name: 'Clear all 3 offers?' })).toBeTruthy()
    expect(screen.getByText(/currency, price unit and deals setting\s+stay/)).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('names a single offer as "the offer"', async () => {
    renderWithMantine(<ClearButton offerCount={1} onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(await screen.findByRole('dialog', { name: 'Clear the offer?' })).toBeTruthy()
  })

  it('clears when confirmed, and closes', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ClearButton offerCount={2} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps everything when cancelled', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ClearButton offerCount={2} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps everything when Escape closes it', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ClearButton offerCount={2} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    await screen.findByRole('dialog')

    await userEvent.keyboard('{Escape}')

    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('is disabled when there is nothing to clear', async () => {
    renderWithMantine(<ClearButton offerCount={0} onConfirm={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Clear' })

    expect(button).toHaveProperty('disabled', true)
    await userEvent.click(button)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('is named "Clear" without repeating it as a tooltip when its text is showing', () => {
    renderWithMantine(<ClearButton offerCount={2} onConfirm={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Clear' }).getAttribute('title')).toBeNull()
  })

  it('shows its name as a tooltip when only the icon is showing', () => {
    renderWithMantine(<ClearButton offerCount={2} onConfirm={vi.fn()} iconOnly />)
    expect(screen.getByRole('button', { name: 'Clear' }).getAttribute('title')).toBe('Clear')
  })
})
