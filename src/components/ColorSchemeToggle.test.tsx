import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import indexHtml from '../../index.html?raw'
import { renderWithMantine } from '../test/render'
import { ColorSchemeToggle } from './ColorSchemeToggle'

const STORAGE_KEY = 'mantine-color-scheme-value'
const pageScheme = (): string | null =>
  document.documentElement.getAttribute('data-mantine-color-scheme')
const option = (name: string): HTMLInputElement => screen.getByRole('radio', { name, hidden: true })

describe('ColorSchemeToggle', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-mantine-color-scheme')
  })

  it('offers light, dark and system in a group named "Color theme"', () => {
    renderWithMantine(<ColorSchemeToggle />)
    const group = screen.getByRole('radiogroup', { name: 'Color theme' })
    const names = [...group.querySelectorAll('label')].map((label) => label.textContent)
    expect(names).toEqual(['Light', 'Dark', 'System'])
  })

  it('shows the current choice as selected', () => {
    renderWithMantine(<ColorSchemeToggle />)
    expect(option('Light').checked).toBe(true)
    expect(option('Dark').checked).toBe(false)
  })

  it('switches the page to dark and remembers it', async () => {
    renderWithMantine(<ColorSchemeToggle />)
    await userEvent.click(screen.getByText('Dark'))

    expect(pageScheme()).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(option('Dark').checked).toBe(true)
  })

  it('remembers "System" as auto, so the device decides', async () => {
    renderWithMantine(<ColorSchemeToggle />)
    await userEvent.click(screen.getByText('Dark'))
    await userEvent.click(screen.getByText('System'))

    expect(localStorage.getItem(STORAGE_KEY)).toBe('auto')
    expect(option('System').checked).toBe(true)
  })

  it('starts from the remembered choice', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    renderWithMantine(<ColorSchemeToggle />)

    expect(option('Dark').checked).toBe(true)
    expect(pageScheme()).toBe('dark')
  })

  it('can be used with the arrow keys', async () => {
    renderWithMantine(<ColorSchemeToggle />)
    option('Light').focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(option('Dark').checked).toBe(true)
    expect(pageScheme()).toBe('dark')
  })

  it('is saved under the key, and applied through the attribute, that the script in index.html uses', async () => {
    renderWithMantine(<ColorSchemeToggle />)
    await userEvent.click(screen.getByText('Dark'))
    const writtenKey = Object.keys(localStorage).find((key) => localStorage.getItem(key) === 'dark')

    expect(indexHtml).toContain(`'${writtenKey}'`)
    expect(indexHtml).toContain('data-mantine-color-scheme')
    expect(pageScheme()).toBe('dark')
  })
})

// The script in index.html runs before the page paints, so a saved choice does not flash the other
// scheme. It is run here against a stubbed storage and device setting, as the browser would.
describe('the color scheme script in index.html', () => {
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
  const realMatchMedia = window.matchMedia
  const run = (saved: string | null, deviceIsDark: boolean): string | null => {
    if (saved !== null) localStorage.setItem(STORAGE_KEY, saved)
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark') && deviceIsDark,
    })) as typeof window.matchMedia
    new Function(script)()
    return pageScheme()
  }

  afterEach(() => {
    window.matchMedia = realMatchMedia
    localStorage.clear()
    document.documentElement.removeAttribute('data-mantine-color-scheme')
  })

  it('is found in the page', () => {
    expect(script).toContain('data-mantine-color-scheme')
  })

  it.each([
    ['nothing saved, dark device', null, true, 'dark'],
    ['nothing saved, light device', null, false, 'light'],
    ['auto saved, dark device', 'auto', true, 'dark'],
    ['auto saved, light device', 'auto', false, 'light'],
    ['dark saved, light device', 'dark', false, 'dark'],
    ['light saved, dark device', 'light', true, 'light'],
  ])('sets the scheme with %s', (_name, saved, deviceIsDark, expected) => {
    expect(run(saved, deviceIsDark)).toBe(expected)
  })

  it('leaves the page alone, without an error, when storage cannot be read', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage is blocked')
    })
    expect(() => run(null, true)).not.toThrow()
    expect(pageScheme()).toBeNull()
    getItem.mockRestore()
  })
})
