import { useRef, useState, type Dispatch } from 'react'
import {
  hasDuplicateFileName,
  hasDuplicateFolderName,
  type DataRoom,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { getNormalizedSelectionTargets, isFolderDescendantOf } from '../model/selectionOps'

interface UseMoveContentWorkflowParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeDataRoom: DataRoom | undefined
  activeFolder: Folder | null
  selectedContentItemIds: NodeId[]
  resolveDisplayName: (value: string) => string
  clearContentItemSelection: () => void
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
}

const EMPTY_TARGETS = { topLevelFolderIds: [], standaloneFileIds: [], itemNames: [] }

export function useMoveContentWorkflow({
  t,
  entities,
  dispatch,
  activeDataRoom,
  activeFolder,
  selectedContentItemIds,
  resolveDisplayName,
  clearContentItemSelection,
  enqueueFeedback,
}: UseMoveContentWorkflowParams) {
  const [isMoveContentDialogOpen, setIsMoveContentDialogOpen] = useState(false)
  const [moveDestinationFolderId, setMoveDestinationFolderId] = useState<NodeId | null>(null)
  const [moveItemIds, setMoveItemIds] = useState<NodeId[]>([])
  const [dragMoveItemIds, setDragMoveItemIds] = useState<NodeId[]>([])
  const [dragMoveTargetFolderId, setDragMoveTargetFolderId] = useState<NodeId | null>(null)
  const dragMoveItemIdsRef = useRef<NodeId[]>([])
  const activeDataRoomId = activeDataRoom?.id ?? null

  const getMoveTargets = (itemIds: NodeId[]) =>
    activeDataRoomId
      ? getNormalizedSelectionTargets(entities, itemIds, activeDataRoomId, resolveDisplayName)
      : EMPTY_TARGETS

  const getMoveValidationError = (itemIds: NodeId[], destinationId: NodeId | null): string | null => {
    if (!destinationId) {
      return t('dataroomMoveNoDestination')
    }

    const moveTargets = getMoveTargets(itemIds)
    const moveItemCount = moveTargets.topLevelFolderIds.length + moveTargets.standaloneFileIds.length
    const destinationFolder = entities.foldersById[destinationId]
    if (!destinationFolder || !activeDataRoom || destinationFolder.dataRoomId !== activeDataRoom.id) {
      return t('dataroomMoveNoDestination')
    }

    if (moveItemCount === 0) {
      return t('dataroomSelectionEmpty')
    }

    for (const folderId of moveTargets.topLevelFolderIds) {
      const folder = entities.foldersById[folderId]
      if (!folder || !folder.parentFolderId) {
        return t('dataroomMoveInvalidFolder')
      }

      if (folder.id === destinationFolder.id) {
        return t('dataroomMoveInvalidSelfFolder', { name: resolveDisplayName(folder.name) })
      }

      if (folder.parentFolderId === destinationFolder.id) {
        return t('dataroomMoveInvalidSameParent')
      }

      if (isFolderDescendantOf(entities, destinationFolder.id, folder.id)) {
        return t('dataroomMoveInvalidDescendant', { name: resolveDisplayName(folder.name) })
      }

      if (hasDuplicateFolderName(entities, destinationFolder.id, folder.name, folder.id)) {
        return t('dataroomMoveInvalidNameConflict', { name: resolveDisplayName(folder.name) })
      }
    }

    for (const fileId of moveTargets.standaloneFileIds) {
      const file = entities.filesById[fileId]
      if (!file) {
        continue
      }

      if (file.parentFolderId === destinationFolder.id) {
        return t('dataroomMoveInvalidSameParent')
      }

      if (hasDuplicateFileName(entities, destinationFolder.id, file.name, file.id)) {
        return t('dataroomMoveInvalidNameConflict', { name: file.name })
      }
    }

    return null
  }

  const moveTargets = getMoveTargets(moveItemIds)
  const moveItemCount = moveTargets.topLevelFolderIds.length + moveTargets.standaloneFileIds.length
  const moveValidationError = getMoveValidationError(moveItemIds, moveDestinationFolderId)

  const moveDestinationFolderOptions = (() => {
    if (!activeDataRoom) {
      return []
    }

    const options: Array<{ id: NodeId; name: string; depth: number; path: string; parentPath: string | null }> = []
    const pushFolderOption = (folderId: NodeId, depth: number, pathSegments: string[]) => {
      const folder = entities.foldersById[folderId]
      if (!folder || folder.dataRoomId !== activeDataRoom.id) {
        return
      }

      const folderDisplayName = resolveDisplayName(folder.name)
      const nextPathSegments = [...pathSegments, folderDisplayName]
      options.push({
        id: folder.id,
        name: folderDisplayName,
        depth,
        path: nextPathSegments.join(' / '),
        parentPath: pathSegments.length > 0 ? pathSegments.join(' / ') : null,
      })

      for (const childFolderId of folder.childFolderIds) {
        pushFolderOption(childFolderId, depth + 1, nextPathSegments)
      }
    }

    pushFolderOption(activeDataRoom.rootFolderId, 0, [])
    return options
  })()

  const closeMoveContentDialog = () => {
    setIsMoveContentDialogOpen(false)
    setMoveItemIds([])
    setMoveDestinationFolderId(null)
  }

  const applyMove = (itemIds: NodeId[], destinationFolderId: NodeId) => {
    const targets = getMoveTargets(itemIds)
    for (const fileId of targets.standaloneFileIds) {
      dispatch({
        type: 'dataroom/moveFile',
        payload: {
          fileId,
          destinationFolderId,
        },
      })
    }

    for (const folderId of targets.topLevelFolderIds) {
      dispatch({
        type: 'dataroom/moveFolder',
        payload: {
          folderId,
          destinationFolderId,
        },
      })
    }

    clearContentItemSelection()
    enqueueFeedback(t('dataroomFeedbackSelectedItemsMoved'), 'success')
  }

  const openMoveSelectedContentDialog = () => {
    if (selectedContentItemIds.length === 0 || !activeFolder) {
      return
    }
    setMoveItemIds(selectedContentItemIds)
    setMoveDestinationFolderId(activeFolder.id)
    setIsMoveContentDialogOpen(true)
  }

  const openMoveFolderDialog = (folder: Folder) => {
    if (!activeFolder) {
      return
    }
    setMoveItemIds([folder.id])
    setMoveDestinationFolderId(activeFolder.id)
    setIsMoveContentDialogOpen(true)
  }

  const openMoveFileDialog = (file: FileNode) => {
    if (!activeFolder) {
      return
    }
    setMoveItemIds([file.id])
    setMoveDestinationFolderId(activeFolder.id)
    setIsMoveContentDialogOpen(true)
  }

  const handleMoveDestinationFolderChange = (folderId: NodeId) => {
    setMoveDestinationFolderId(folderId)
  }

  const handleMoveSelectedContent = () => {
    if (moveValidationError || !moveDestinationFolderId) {
      return
    }
    applyMove(moveItemIds, moveDestinationFolderId)
    closeMoveContentDialog()
  }

  const isDragMoveActive = dragMoveItemIds.length > 0
  const getCurrentDragMoveItemIds = () => (dragMoveItemIds.length > 0 ? dragMoveItemIds : dragMoveItemIdsRef.current)
  const resolveDragMoveItemIds = (itemId: NodeId) =>
    selectedContentItemIds.includes(itemId) ? selectedContentItemIds : [itemId]
  const startDragMove = (itemId: NodeId) => {
    if (!entities.foldersById[itemId] && !entities.filesById[itemId]) {
      return
    }
    const nextDragItemIds = resolveDragMoveItemIds(itemId)
    dragMoveItemIdsRef.current = nextDragItemIds
    setDragMoveItemIds(nextDragItemIds)
    setDragMoveTargetFolderId(null)
  }
  const endDragMove = () => {
    setDragMoveItemIds([])
    setDragMoveTargetFolderId(null)
  }
  const setDragMoveTargetFolder = (folderId: NodeId | null) => {
    setDragMoveTargetFolderId(folderId)
  }
  const canDropOnFolder = (folderId: NodeId) => {
    const currentDragItemIds = getCurrentDragMoveItemIds()
    if (currentDragItemIds.length === 0) {
      return false
    }
    return getMoveValidationError(currentDragItemIds, folderId) === null
  }
  const dropOnFolder = (folderId: NodeId) => {
    const currentDragItemIds = getCurrentDragMoveItemIds()
    if (!canDropOnFolder(folderId)) {
      return
    }
    applyMove(currentDragItemIds, folderId)
    endDragMove()
  }
  return {
    isMoveContentDialogOpen,
    moveItemCount,
    moveItemNames: moveTargets.itemNames,
    moveDestinationFolderId,
    moveDestinationFolderOptions,
    moveValidationError,
    dragMoveActive: isDragMoveActive,
    dragMoveItemIds,
    dragMoveTargetFolderId,
    openMoveSelectedContentDialog,
    openMoveFolderDialog,
    openMoveFileDialog,
    closeMoveContentDialog,
    handleMoveDestinationFolderChange,
    handleMoveSelectedContent,
    startDragMove,
    endDragMove,
    setDragMoveTargetFolder,
    canDropOnFolder,
    dropOnFolder,
  }
}
