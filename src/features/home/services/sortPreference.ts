import type { SortState } from '../model/homeViewTypes'

const SORT_PREFERENCE_STORAGE_KEY = 'dataroom/view-preferences'
let inMemorySortPreference: SortState = { field: 'name', direction: 'asc' }

export function loadSortModePreference(): SortState {
  if (typeof window === 'undefined') {
    return inMemorySortPreference
  }

  try {
    const raw = window.localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY)

    if (!raw) {
      return inMemorySortPreference
    }

    const parsed = JSON.parse(raw) as { sortField?: string; sortDirection?: string; sortMode?: string }

    if (
      (parsed.sortField === 'name' || parsed.sortField === 'type' || parsed.sortField === 'updated') &&
      (parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc')
    ) {
      return { field: parsed.sortField, direction: parsed.sortDirection }
    }

    // Backward compatibility with previous select-based sort mode.
    if (parsed.sortMode === 'name-asc') {
      return { field: 'name', direction: 'asc' }
    }
    if (parsed.sortMode === 'name-desc') {
      return { field: 'name', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-desc') {
      return { field: 'updated', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-asc') {
      return { field: 'updated', direction: 'asc' }
    }
    if (parsed.sortMode === 'type') {
      return { field: 'type', direction: 'asc' }
    }
  } catch {
    return inMemorySortPreference
  }

  return inMemorySortPreference
}

export function saveSortModePreference(sortState: SortState): void {
  inMemorySortPreference = sortState

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      SORT_PREFERENCE_STORAGE_KEY,
      JSON.stringify({ sortField: sortState.field, sortDirection: sortState.direction }),
    )
  } catch {
    // Ignore persistence failures and keep in-memory preference.
  }
}
