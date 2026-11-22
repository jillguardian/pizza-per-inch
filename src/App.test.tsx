import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('starts with two pizzas to compare', () => {
    render(<App />)
    expect(screen.getAllByLabelText('Name')).toHaveLength(2)
  })

  it('adds and removes pizzas', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '+ Add pizza' }))
    expect(screen.getAllByLabelText('Name')).toHaveLength(3)

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    expect(screen.getAllByLabelText('Name')).toHaveLength(2)
  })

  it('applies the chosen currency to every pizza', async () => {
    render(<App />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'EUR')

    expect(screen.getAllByLabelText('Price (EUR)')).toHaveLength(2)
  })

  it('shows prices in the chosen area unit', async () => {
    render(<App />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show price per' }), 'cm')

    expect(screen.getAllByText(/ \/ cm²$/)).toHaveLength(2)
  })
})
