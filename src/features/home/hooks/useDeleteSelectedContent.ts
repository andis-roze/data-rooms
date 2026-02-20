import type { Dispatch, SetStateAction } from 'react'
import { getFileIdsForFolderCascadeDelete, type DataRoomState, type NodeId } from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import type { FileBlobStorageService } from '../services/fileBlobStorage'

interface DeleteSelectionTargets {
  standaloneFileIds: NodeId[]
  topLevelFolderIds: NodeId[]
}

interface UseDeleteSelectedContentParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  fileBlobStorage: FileBlobStorageService
  deleteSelectionItemIds: NodeId[]
  deleteSelectionTargets: DeleteSelectionTargets
  clearContentItemSelection: () => void
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setIsDeleteSelectedContentDialogOpen: Dispatch<SetStateAction<boolean>>
}

export function useDeleteSelectedContent({
  t,
  entities,
  dispatch,
  fileBlobStorage,
  deleteSelectionItemIds,
  deleteSelectionTargets,
  clearContentItemSelection,
  enqueueFeedback,
  setIsDeleteSelectedContentDialogOpen,
}: UseDeleteSelectedContentParams) {
  const openDeleteSelectedContentDialog = () => {
    if (deleteSelectionItemIds.length > 0) {
      setIsDeleteSelectedContentDialogOpen(true)
    }
  }

  const closeDeleteSelectedContentDialog = () => {
    setIsDeleteSelectedContentDialogOpen(false)
  }

  const handleDeleteSelectedContent = async () => {
    if (deleteSelectionItemIds.length === 0) {
      return
    }

    for (const fileId of deleteSelectionTargets.standaloneFileIds) {
      dispatch({ type: 'dataroom/deleteFile', payload: { fileId } })
    }

    for (const folderId of deleteSelectionTargets.topLevelFolderIds) {
      dispatch({ type: 'dataroom/deleteFolder', payload: { folderId } })
    }

    const fileIdsForCleanup = new Set<NodeId>(deleteSelectionTargets.standaloneFileIds)
    for (const folderId of deleteSelectionTargets.topLevelFolderIds) {
      const nestedFileIds = getFileIdsForFolderCascadeDelete(entities, folderId)
      for (const fileId of nestedFileIds) {
        fileIdsForCleanup.add(fileId)
      }
    }

    setIsDeleteSelectedContentDialogOpen(false)
    clearContentItemSelection()
    enqueueFeedback(t('dataroomFeedbackSelectedItemsDeleted'), 'success')

    try {
      await fileBlobStorage.deleteManyBlobs([...fileIdsForCleanup])
    } catch {
      // Best-effort cleanup only.
    }
  }

  return {
    openDeleteSelectedContentDialog,
    closeDeleteSelectedContentDialog,
    handleDeleteSelectedContent,
  }
}
