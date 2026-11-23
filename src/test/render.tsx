import { MantineProvider } from '@mantine/core'
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'

export function renderWithMantine(ui: ReactElement): RenderResult {
  return render(<MantineProvider>{ui}</MantineProvider>)
}
