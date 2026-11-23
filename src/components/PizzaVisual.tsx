import { Fragment, type ReactElement } from 'react'
import type { PizzaShape } from '../lib/pizza'

const PEPPERONI_RING_RATIOS = [
  { radius: 0.55, count: 6 },
  { radius: 0.25, count: 3 },
]

interface PizzaVisualProps {
  shape: PizzaShape
  width: number
  length: number
  maxSize: number
  label: string
}

const MAX_SIZE_PX = 180
const MIN_SIZE_PX = 20
const CRUST_WIDTH = 6
const PEPPERONI_COLOR = '#c0392b'

function toPx(size: number, maxSize: number): number {
  return Math.max(MIN_SIZE_PX, (size / Math.max(maxSize, 1)) * MAX_SIZE_PX)
}

export function PizzaVisual({
  shape,
  width,
  length,
  maxSize,
  label,
}: Readonly<PizzaVisualProps>): ReactElement {
  const widthPx = toPx(width, maxSize)
  const lengthPx = toPx(length, maxSize)

  return shape === 'round' ? (
    <RoundPizza sizePx={widthPx} label={label} />
  ) : (
    <RectangularPizza widthPx={widthPx} lengthPx={lengthPx} label={label} />
  )
}

function RoundPizza({ sizePx, label }: Readonly<{ sizePx: number; label: string }>): ReactElement {
  const center = 50

  return (
    <svg viewBox="0 0 100 100" width={sizePx} height={sizePx} role="img" aria-label={label}>
      <circle cx={center} cy={center} r={48} fill="#d9a05b" />
      <circle cx={center} cy={center} r={48 - CRUST_WIDTH} fill="#f2c14e" />
      {PEPPERONI_RING_RATIOS.map(({ radius, count }) => (
        <Fragment key={radius}>
          {Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * 2 * Math.PI
            return (
              <circle
                key={i}
                cx={center + Math.cos(angle) * radius * 42}
                cy={center + Math.sin(angle) * radius * 42}
                r={6}
                fill={PEPPERONI_COLOR}
              />
            )
          })}
        </Fragment>
      ))}
    </svg>
  )
}

// The viewBox matches the pixel size, so the crust and pepperoni keep their size in pixels
// however long or wide the pizza is.
function RectangularPizza({
  widthPx,
  lengthPx,
  label,
}: Readonly<{ widthPx: number; lengthPx: number; label: string }>): ReactElement {
  const crust = Math.min(CRUST_WIDTH, widthPx / 4, lengthPx / 4)
  const pepperoniRadius = Math.max(2, Math.min(widthPx, lengthPx) / 14)
  const pitch = pepperoniRadius * 4
  const columns = Math.max(1, Math.floor((widthPx - 2 * crust) / pitch))
  const rows = Math.max(1, Math.floor((lengthPx - 2 * crust) / pitch))

  return (
    <svg
      viewBox={`0 0 ${widthPx} ${lengthPx}`}
      width={widthPx}
      height={lengthPx}
      role="img"
      aria-label={label}
    >
      <rect width={widthPx} height={lengthPx} rx={6} fill="#d9a05b" />
      <rect
        x={crust}
        y={crust}
        width={widthPx - 2 * crust}
        height={lengthPx - 2 * crust}
        rx={3}
        fill="#f2c14e"
      />
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (_, column) => (
          <circle
            key={`${row}-${column}`}
            cx={((column + 0.5) / columns) * widthPx}
            cy={((row + 0.5) / rows) * lengthPx}
            r={pepperoniRadius}
            fill={PEPPERONI_COLOR}
          />
        )),
      )}
    </svg>
  )
}
