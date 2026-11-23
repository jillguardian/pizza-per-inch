// Mantine reports partial input such as "." as a string, which Number() turns into NaN.
export function toNumber(value: number | string): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
