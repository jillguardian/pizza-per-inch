import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PizzaVisual } from './PizzaVisual'

const size = (name: string): { width: number; height: number } => {
  const image = screen.getByRole('img', { name })
  return {
    width: Number(image.getAttribute('width')),
    height: Number(image.getAttribute('height')),
  }
}

describe('PizzaVisual', () => {
  it('is described by its label', () => {
    render(<PizzaVisual shape="round" width={12} length={12} maxSize={12} label="12 in pizza" />)
    expect(screen.getByRole('img', { name: '12 in pizza' })).toBeTruthy()
  })

  it('draws a round pizza at half the size when it is half the diameter', () => {
    render(
      <>
        <PizzaVisual shape="round" width={16} length={16} maxSize={16} label="large" />
        <PizzaVisual shape="round" width={8} length={8} maxSize={16} label="small" />
      </>,
    )

    expect(size('small').width).toBe(size('large').width / 2)
  })

  it('draws a rectangular pizza with the proportions of its sides', () => {
    render(<PizzaVisual shape="rectangular" width={8} length={16} maxSize={16} label="sheet" />)

    expect(size('sheet').height).toBe(size('sheet').width * 2)
  })

  it('uses the same scale for round and rectangular pizzas', () => {
    render(
      <>
        <PizzaVisual shape="round" width={16} length={16} maxSize={16} label="round" />
        <PizzaVisual shape="rectangular" width={16} length={8} maxSize={16} label="sheet" />
      </>,
    )

    expect(size('sheet').width).toBe(size('round').width)
  })

  it('stays visible for tiny sizes', () => {
    render(<PizzaVisual shape="round" width={0} length={0} maxSize={16} label="empty" />)
    expect(size('empty').width).toBeGreaterThan(0)
  })

  it('stays visible for a rectangle with a missing side', () => {
    render(<PizzaVisual shape="rectangular" width={0} length={16} maxSize={16} label="flat" />)
    expect(size('flat').width).toBeGreaterThan(0)
  })
})
