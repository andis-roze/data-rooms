import type { HomeActionCommonParams } from './actionParams'
import { getNextSortState } from '../selectors/homeSorting'
import type { SortField } from '../model/homeViewTypes'
import { saveSortModePreference } from '../services/sortPreference'

type Params = Pick<HomeActionCommonParams, 'sortState' | 'setSortState'>

export function useSortActions({ sortState, setSortState }: Params) {
  const toggleSort = (field: SortField) => {
    const nextState = getNextSortState(sortState, field)

    setSortState(nextState)
    saveSortModePreference(nextState)
  }

  return { toggleSort }
}
