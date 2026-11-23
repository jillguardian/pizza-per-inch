// The top three ranks each get their own color, and every other rank shares one.
const PODIUM_COLORS = ['green', 'blue', 'orange']
const DEFAULT_RANK_COLOR = 'gray'

export function rankColor(rank: number): string {
  return PODIUM_COLORS[rank - 1] ?? DEFAULT_RANK_COLOR
}
