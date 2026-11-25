import { VisuallyHidden } from '@mantine/core'
import type { ReactElement } from 'react'

// <output> is a polite live region (role="status"): it is read out when its text changes,
// without moving focus.
export function LiveRegion({ message }: Readonly<{ message: string }>): ReactElement {
  return <VisuallyHidden component="output">{message}</VisuallyHidden>
}
