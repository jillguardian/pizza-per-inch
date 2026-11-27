import { Button, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { ReactElement } from 'react'
import { ResetIcon } from './ResetIcon'

interface Props {
  onConfirm: () => void
  // The label is hidden, so the icon gets a tooltip. With the label showing, a tooltip would only
  // repeat it.
  iconOnly?: boolean
}

// Asks first, because the comparison is remembered and this replaces it. On a phone the label is
// hidden by Toolbar.css to make room, so the name is set here and does not depend on it.
export function ResetButton({ onConfirm, iconOnly = false }: Readonly<Props>): ReactElement {
  const [opened, { open, close }] = useDisclosure(false)

  function confirm(): void {
    onConfirm()
    close()
  }

  return (
    <>
      <Button
        variant="default"
        leftSection={<ResetIcon />}
        onClick={open}
        aria-label="Reset"
        title={iconOnly ? 'Reset' : undefined}
        classNames={{ root: 'toolbar-icon-only', section: 'toolbar-button-icon' }}
      >
        <span className="toolbar-button-label">Reset</span>
      </Button>
      <Modal opened={opened} onClose={close} title="Reset the comparison?" centered>
        <Text mb="md">
          This replaces your offers with the two examples and clears the currency, price unit and
          options you chose. It cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button onClick={confirm}>Reset</Button>
        </Group>
      </Modal>
    </>
  )
}
