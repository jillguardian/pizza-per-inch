// The top three ranks each get their own color, and every other rank shares one. The names are
// the rank palettes registered in theme.ts.
const PODIUM_COLORS = ['rank-1', 'rank-2', 'rank-3']
const DEFAULT_RANK_COLOR = 'rank-other'

export function rankColor(rank: number): string {
  return PODIUM_COLORS[rank - 1] ?? DEFAULT_RANK_COLOR
}
