import type { NodeId } from '../../dataroom/model'
import type { FolderContentItem } from '../types'

interface UseFolderTableSelectionParams {
  items: FolderContentItem[]
  selectedItemIds: NodeId[]
}

export function useFolderTableSelection({ items, selectedItemIds }: UseFolderTableSelectionParams) {
  const selectableItemIds = items.map((item) => item.id)
  const selectedItemIdSet = new Set(selectedItemIds)
  const selectedSelectableCount = selectableItemIds.filter((itemId) => selectedItemIdSet.has(itemId)).length
  const areAllSelectableItemsSelected = selectableItemIds.length > 0 && selectedSelectableCount === selectableItemIds.length
  const isSelectAllIndeterminate = selectedSelectableCount > 0 && !areAllSelectableItemsSelected

  return {
    selectableItemIds,
    selectedItemIdSet,
    areAllSelectableItemsSelected,
    isSelectAllIndeterminate,
  }
}
