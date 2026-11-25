import { useCallback, useState } from 'react'

interface Announcer {
  message: string
  announce: (text: string) => void
}

// A screen reader only speaks a live region when its text changes, so saying the same thing
// twice in a row needs a different string. A trailing non-breaking space is not spoken.
export function useAnnouncer(): Announcer {
  const [message, setMessage] = useState('')
  const announce = useCallback((text: string): void => {
    setMessage((previous) => (previous === text ? `${text} ` : text))
  }, [])
  return { message, announce }
}
