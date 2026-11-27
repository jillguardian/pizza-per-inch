import type { ReactElement } from 'react'

export function SortIcon(): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h10M3 12h7M3 18h4" />
      <path d="M17 5v14M14 16l3 3 3-3" />
    </svg>
  )
}
