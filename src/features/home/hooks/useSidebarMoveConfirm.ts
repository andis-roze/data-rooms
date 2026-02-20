import { useState } from 'react'
import type { DataRoomState, NodeId } from '../../dataroom/model'

interface UseSidebarMoveConfirmParams {
  entities: DataRoomState
  selectedContentItemIds: NodeId[]
  dragMoveItemIds: NodeId[]
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onMoveItemsToFolder: (itemIds: NodeId[], folderId: NodeId) => void
}

export function useSidebarMoveConfirm({
  entities,
  selectedContentItemIds,
  dragMoveItemIds,
  onCanDropOnFolder,
  onMoveItemsToFolder,
}: UseSidebarMoveConfirmParams) {
  const [moveConfirmState, setMoveConfirmState] = useState<{
    open: boolean
    itemIds: NodeId[]
    destinationFolderId: NodeId | null
  }>({
    open: false,
    itemIds: [],
    destinationFolderId: null,
  })

  const closeMoveConfirmDialog = () => {
    setMoveConfirmState({
      open: false,
      itemIds: [],
      destinationFolderId: null,
    })
  }

  const openMoveConfirmDialog = (destinationFolderId: NodeId, draggedItemId?: NodeId) => {
    const pendingIds =
      dragMoveItemIds.length > 0
        ? dragMoveItemIds
        : selectedContentItemIds.length > 0
          ? selectedContentItemIds
          : draggedItemId
            ? [draggedItemId]
            : []

    if (pendingIds.length === 0 || !onCanDropOnFolder(destinationFolderId)) {
      return
    }

    setMoveConfirmState({
      open: true,
      itemIds: pendingIds,
      destinationFolderId,
    })
  }

  const confirmMove = () => {
    if (!moveConfirmState.destinationFolderId || moveConfirmState.itemIds.length === 0) {
      return
    }
    onMoveItemsToFolder(moveConfirmState.itemIds, moveConfirmState.destinationFolderId)
    closeMoveConfirmDialog()
  }

  const getPendingDestinationFolderName = (resolveDisplayName: (value: string) => string) => {
    if (!moveConfirmState.destinationFolderId) {
      return ''
    }
    return resolveDisplayName(entities.foldersById[moveConfirmState.destinationFolderId]?.name ?? '')
  }

  return {
    moveConfirmState,
    closeMoveConfirmDialog,
    openMoveConfirmDialog,
    confirmMove,
    getPendingDestinationFolderName,
  }
}
