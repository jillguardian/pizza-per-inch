import {
  Center,
  SegmentedControl,
  VisuallyHidden,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core'
import type { ReactElement } from 'react'
import { MonitorIcon } from './MonitorIcon'
import { MoonIcon } from './MoonIcon'
import { SunIcon } from './SunIcon'

const OPTIONS: { value: MantineColorScheme; name: string; icon: ReactElement }[] = [
  { value: 'light', name: 'Light', icon: <SunIcon /> },
  { value: 'dark', name: 'Dark', icon: <MoonIcon /> },
  { value: 'auto', name: 'System', icon: <MonitorIcon /> },
]

// Mantine remembers the choice in localStorage. "System" follows the device's own setting.
export function ColorSchemeToggle(): ReactElement {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  return (
    <SegmentedControl
      aria-label="Color theme"
      size="md"
      h="var(--page-action-size)"
      value={colorScheme}
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
      data={OPTIONS.map(({ value, name, icon }) => ({
        value,
        label: (
          <Center title={name}>
            {icon}
            <VisuallyHidden>{name}</VisuallyHidden>
          </Center>
        ),
      }))}
    />
  )
}
