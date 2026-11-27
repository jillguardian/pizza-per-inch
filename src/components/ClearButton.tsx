import { Button, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRef, type ReactElement } from 'react'
import { EraserIcon } from './EraserIcon'
import { ADD_OFFER_ID } from './focusIds'

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
  const confirmed = useRef(false)

  function confirm(): void {
    confirmed.current = true
    onConfirm()
    close()
  }

  // Clearing disables this button, so the dialog has nowhere to give focus back to. After a
  // confirmed clear, focus goes to the button that starts the next comparison. After Cancel or
  // Escape it goes back to this button, as usual.
  function focusAddOfferAfterClear(): void {
    if (!confirmed.current) return
    confirmed.current = false
    document.getElementById(ADD_OFFER_ID)?.focus()
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
        onExitTransitionEnd={focusAddOfferAfterClear}
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
