import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithMantine } from '../test/render'
import { ResetButton } from './ResetButton'

describe('ResetButton', () => {
  it('does nothing until it is confirmed', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ResetButton onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(await screen.findByRole('dialog', { name: 'Reset the comparison?' })).toBeTruthy()
    expect(screen.getByText(/replaces your offers with the two examples/)).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('resets when confirmed, and closes', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ResetButton onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps everything when cancelled', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ResetButton onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('keeps everything when Escape closes it', async () => {
    const onConfirm = vi.fn()
    renderWithMantine(<ResetButton onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    await screen.findByRole('dialog')

    await userEvent.keyboard('{Escape}')

    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
