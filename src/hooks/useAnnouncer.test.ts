import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAnnouncer } from './useAnnouncer'

describe('useAnnouncer', () => {
  it('starts with nothing to say', () => {
    const { result } = renderHook(() => useAnnouncer())
    expect(result.current.message).toBe('')
  })

  it('changes the text when the same thing is said twice, so it is spoken again', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => result.current.announce('Sorted'))
    const first = result.current.message
    act(() => result.current.announce('Sorted'))
    const second = result.current.message

    expect(second).not.toBe(first)
    expect(second.trim()).toBe('Sorted')
  })
})
