import { Fragment, type ReactElement } from 'react'

const PEPPERONI_RING_RATIOS = [
  { radius: 0.55, count: 6 },
  { radius: 0.25, count: 3 },
]

interface PizzaVisualProps {
  diameter: number
  maxDiameter: number
  label: string
}

const MAX_SIZE_PX = 180

export function PizzaVisual({
  diameter,
  maxDiameter,
  label,
}: Readonly<PizzaVisualProps>): ReactElement {
  const sizePx = Math.max(20, (diameter / Math.max(maxDiameter, 1)) * MAX_SIZE_PX)
  const center = 50
  const crustWidth = 6

  return (
    <svg viewBox="0 0 100 100" width={sizePx} height={sizePx} role="img" aria-label={label}>
      <circle cx={center} cy={center} r={48} fill="#d9a05b" />
      <circle cx={center} cy={center} r={48 - crustWidth} fill="#f2c14e" />
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
                fill="#c0392b"
              />
            )
          })}
        </Fragment>
      ))}
    </svg>
  )
}
