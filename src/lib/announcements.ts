// What a screen reader is told when something changes on the page and nothing moves focus.

const label = (name: string): string => name.trim() || 'Unnamed offer'

const countOf = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`

export function offerAdded(total: number): string {
  return `Offer added. ${countOf(total, 'offer')}.`
}

export function offerRemoved(name: string, remaining: number): string {
  const left = remaining === 0 ? 'No offers left.' : `${countOf(remaining, 'offer')} left.`
  return `${label(name)} removed. ${left}`
}

export function pizzaAdded(offerName: string, position: number): string {
  return `Pizza ${position} of ${position} added to ${label(offerName)}.`
}

export function pizzaRemoved(offerName: string, remaining: number): string {
  return `Pizza removed from ${label(offerName)}. ${countOf(remaining, 'pizza')} left.`
}

export function sortedByValue(namesBestFirst: string[]): string {
  return `Sorted by value, best first: ${namesBestFirst.map(label).join(', ')}.`
}

export const NOTHING_TO_SORT = 'Nothing to sort yet. At least two offers need a size and a price.'

export function bestValue(names: string[]): string {
  const list = names.map(label).join(' and ')
  return names.length === 1
    ? `${list} is now the best value.`
    : `${list} are now tied for the best value.`
}

export const OFFERS_CLEARED = 'All offers cleared. Add an offer to start comparing.'
