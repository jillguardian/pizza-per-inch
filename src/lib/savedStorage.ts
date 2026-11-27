import { parseSaved, serializeSaved, type SavedComparison } from './saved'

const STORAGE_KEY = 'pizza-per-inch:comparison'

// Storage can be missing, blocked (private browsing) or full, and none of that may break the page.
export function loadSaved(isCurrency: (code: string) => boolean): SavedComparison | null {
  try {
    return parseSaved(localStorage.getItem(STORAGE_KEY), isCurrency)
  } catch {
    return null
  }
}

export function saveComparison(saved: SavedComparison): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSaved(saved))
  } catch {
    // The comparison still works for this visit, it just will not be remembered.
  }
}
