import { ActionIcon } from '@mantine/core'
import type { ReactElement } from 'react'
import { REPOSITORY_URL } from '../links'
import { GitHubIcon } from './GitHubIcon'

// The name says the link opens a new tab, because a link that does so without warning surprises a
// screen reader user.
export function ProjectLinks(): ReactElement {
  return (
    <ActionIcon
      component="a"
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      variant="default"
      size={36}
      aria-label="View the code on GitHub (opens in a new tab)"
      title="View the code on GitHub"
    >
      <GitHubIcon />
    </ActionIcon>
  )
}
