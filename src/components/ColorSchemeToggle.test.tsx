import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
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

  it('is read before the page paints by the script in index.html, with the key and attribute Mantine writes', async () => {
    renderWithMantine(<ColorSchemeToggle />)
    await userEvent.click(screen.getByText('Dark'))
    const writtenKey = Object.keys(localStorage).find((key) => localStorage.getItem(key) === 'dark')

    expect(indexHtml).toContain(`'${writtenKey}'`)
    expect(indexHtml).toContain('data-mantine-color-scheme')
    expect(pageScheme()).toBe('dark')
  })
})
