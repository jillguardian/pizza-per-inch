import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { REPOSITORY_URL } from '../links'
import { renderWithMantine } from '../test/render'
import { ProjectLinks } from './ProjectLinks'

describe('ProjectLinks', () => {
  it('links to the repository', () => {
    renderWithMantine(<ProjectLinks />)
    const link = screen.getByRole('link', { name: /View the code on GitHub/ })
    expect(link.getAttribute('href')).toBe(REPOSITORY_URL)
    expect(new URL(REPOSITORY_URL).hostname).toBe('github.com')
  })

  it('shows the same words as a tooltip, so a screen reader does not read them twice', () => {
    renderWithMantine(<ProjectLinks />)
    const link = screen.getByRole('link', { name: /View the code on GitHub/ })
    expect(link.getAttribute('title')).toBe(link.getAttribute('aria-label'))
  })

  it('opens in a new tab without handing over the opener, and says so in its name', () => {
    renderWithMantine(<ProjectLinks />)
    const link = screen.getByRole('link', { name: /View the code on GitHub/ })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
    expect(link.getAttribute('aria-label')).toContain('opens in a new tab')
  })
})
