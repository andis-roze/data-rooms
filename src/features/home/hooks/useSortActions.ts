import type { Dispatch, SetStateAction } from 'react'
import type { SortField, SortState } from '../model/homeViewTypes'
import { getNextSortState } from '../selectors/homeSorting'
import { saveSortModePreference } from '../services/sortPreference'

interface UseSortActionsParams {
  sortState: SortState
  setSortState: Dispatch<SetStateAction<SortState>>
}

export function useSortActions({ sortState, setSortState }: UseSortActionsParams) {
  const toggleSort = (field: SortField) => {
    const nextState = getNextSortState(sortState, field)

    setSortState(nextState)
    saveSortModePreference(nextState)
  }

  return { toggleSort }
}
