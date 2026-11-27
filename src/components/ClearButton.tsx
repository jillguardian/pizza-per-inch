import { Button, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { ReactElement } from 'react'
import { EraserIcon } from './EraserIcon'

interface Props {
  offerCount: number
  onConfirm: () => void
  // The label is hidden, so the icon gets a tooltip. With the label showing, a tooltip would only
  // repeat it.
  iconOnly?: boolean
}

// Asks first, because the offers are remembered and this removes all of them. Only the offers: the
// currency, price unit and deals setting are preferences, and stay. On a phone the label is hidden
// by Toolbar.css to make room, so the name is set here and does not depend on it.
export function ClearButton({
  offerCount,
  onConfirm,
  iconOnly = false,
}: Readonly<Props>): ReactElement {
  const [opened, { open, close }] = useDisclosure(false)

  function confirm(): void {
    onConfirm()
    close()
  }

  return (
    <>
      <Button
        variant="default"
        leftSection={<EraserIcon />}
        onClick={open}
        disabled={offerCount === 0}
        aria-label="Clear"
        title={iconOnly ? 'Clear' : undefined}
        classNames={{ root: 'toolbar-icon-only', section: 'toolbar-button-icon' }}
      >
        <span className="toolbar-button-label">Clear</span>
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title={offerCount === 1 ? 'Clear the offer?' : `Clear all ${offerCount} offers?`}
        centered
      >
        <Text mb="md">
          This removes every offer you have entered. Your currency, price unit and deals setting
          stay as they are. It cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button onClick={confirm}>Clear</Button>
        </Group>
      </Modal>
    </>
  )
}
