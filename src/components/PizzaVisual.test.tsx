import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PizzaVisual } from './PizzaVisual'

describe('PizzaVisual', () => {
  it('is described by its label', () => {
    render(<PizzaVisual diameter={12} maxDiameter={12} label="12 in pizza" />)
    expect(screen.getByRole('img', { name: '12 in pizza' })).toBeTruthy()
  })

  it('draws a pizza at half the size when it is half the diameter', () => {
    render(
      <>
        <PizzaVisual diameter={16} maxDiameter={16} label="large" />
        <PizzaVisual diameter={8} maxDiameter={16} label="small" />
      </>,
    )

    const large = Number(screen.getByRole('img', { name: 'large' }).getAttribute('width'))
    const small = Number(screen.getByRole('img', { name: 'small' }).getAttribute('width'))

    expect(small).toBe(large / 2)
  })

  it('stays visible for tiny sizes', () => {
    render(<PizzaVisual diameter={0} maxDiameter={16} label="empty" />)
    expect(Number(screen.getByRole('img').getAttribute('width'))).toBeGreaterThan(0)
  })
})
