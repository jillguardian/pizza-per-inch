import { MantineProvider } from '@mantine/core'
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { cssVariablesResolver, theme } from '../theme'

export function renderWithMantine(ui: ReactElement): RenderResult {
  return render(
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      {ui}
    </MantineProvider>,
  )
}
