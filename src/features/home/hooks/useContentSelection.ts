import { useState } from 'react'
import { getFolderDeleteSummary, type DataRoomState, type NodeId } from '../../dataroom/model'
import { type FolderContentItem } from '../model/homeViewTypes'
import {
  getNormalizedSelectionTargets,
  isActionableFolder,
  isFileInDataRoom,
  isFolderInDataRoom,
  isNodeInsideFolder,
} from '../model/selectionOps'

interface UseContentSelectionParams {
  entities: DataRoomState
  activeDataRoomId: NodeId | null
  visibleContentItems: FolderContentItem[]
  resolveDisplayName: (value: string) => string
}

const EMPTY_SELECTION_TARGETS = { topLevelFolderIds: [], standaloneFileIds: [], itemNames: [] }

export function useContentSelection({
  entities,
  activeDataRoomId,
  visibleContentItems,
  resolveDisplayName,
}: UseContentSelectionParams) {
  const [includedContentItemIds, setIncludedContentItemIds] = useState<NodeId[]>([])
  const [excludedContentItemIds, setExcludedContentItemIds] = useState<NodeId[]>([])
  const selectableContentItems = visibleContentItems

  const includedIdSet = new Set(includedContentItemIds)
  const excludedIdSet = new Set(excludedContentItemIds)
  const markForFolder = (folderId: NodeId): 'include' | 'exclude' | null => {
    let currentFolderId: NodeId | null = folderId
    while (currentFolderId) {
      if (includedIdSet.has(currentFolderId)) {
        return 'include'
      }
      if (excludedIdSet.has(currentFolderId)) {
        return 'exclude'
      }
      currentFolderId = entities.foldersById[currentFolderId]?.parentFolderId ?? null
    }
    return null
  }

  const isFolderInActiveDataRoom = (folderId: NodeId) =>
    Boolean(activeDataRoomId && isFolderInDataRoom(entities, folderId, activeDataRoomId))
  const isActionableFolderInActiveDataRoom = (folderId: NodeId) =>
    Boolean(activeDataRoomId && isActionableFolder(entities, folderId, activeDataRoomId))
  const isFileInActiveDataRoom = (fileId: NodeId) =>
    Boolean(activeDataRoomId && isFileInDataRoom(entities, fileId, activeDataRoomId))
  const isFileSelectedByMarks = (fileId: NodeId) => {
    const file = entities.filesById[fileId]
    if (!file) {
      return false
    }

    if (includedIdSet.has(file.id)) {
      return true
    }
    if (excludedIdSet.has(file.id)) {
      return false
    }

    return markForFolder(file.parentFolderId) === 'include'
  }

  const folderSelectedMemo = new Map<NodeId, boolean>()
  const folderHasSelectedDescendantsMemo = new Map<NodeId, boolean>()
  const hasSelectedDescendants = (folderId: NodeId): boolean => {
    const memoizedValue = folderHasSelectedDescendantsMemo.get(folderId)
    if (memoizedValue !== undefined) {
      return memoizedValue
    }

    const folder = entities.foldersById[folderId]
    if (!folder) {
      folderHasSelectedDescendantsMemo.set(folderId, false)
      return false
    }

    const hasSelectedChildFile = folder.fileIds.some((fileId) => isFileSelectedByMarks(fileId))
    if (hasSelectedChildFile) {
      folderHasSelectedDescendantsMemo.set(folderId, true)
      return true
    }

    const hasSelectedInChildSubtree = folder.childFolderIds.some((childFolderId) => {
      if (isFolderSelectedByMarks(childFolderId)) {
        return true
      }
      return hasSelectedDescendants(childFolderId)
    })

    folderHasSelectedDescendantsMemo.set(folderId, hasSelectedInChildSubtree)
    return hasSelectedInChildSubtree
  }
  const isFolderSelectedByMarks = (folderId: NodeId): boolean => {
    const memoizedValue = folderSelectedMemo.get(folderId)
    if (memoizedValue !== undefined) {
      return memoizedValue
    }

    const folder = entities.foldersById[folderId]
    if (!folder || markForFolder(folder.id) !== 'include') {
      folderSelectedMemo.set(folderId, false)
      return false
    }

    const hasChildren = folder.childFolderIds.length > 0 || folder.fileIds.length > 0
    if (!hasChildren) {
      folderSelectedMemo.set(folderId, true)
      return true
    }

    const nextValue = hasSelectedDescendants(folder.id)
    folderSelectedMemo.set(folderId, nextValue)
    return nextValue
  }
  const isContentItemSelected = (itemId: NodeId) => {
    const folder = entities.foldersById[itemId]
    if (folder) {
      return isFolderSelectedByMarks(folder.id)
    }

    const file = entities.filesById[itemId]
    if (!file) {
      return false
    }

    return isFileSelectedByMarks(file.id)
  }

  const selectedFolderIds = Object.values(entities.foldersById)
    .filter((folder) => isActionableFolderInActiveDataRoom(folder.id))
    .map((folder) => folder.id)
    .filter((folderId) => isContentItemSelected(folderId))
  const selectedFileIds = Object.values(entities.filesById)
    .filter((file) => isFileInActiveDataRoom(file.id))
    .map((file) => file.id)
    .filter((fileId) => isContentItemSelected(fileId))
  const selectedContentItemIds = [...selectedFolderIds, ...selectedFileIds]

  const selectedFiles = selectedFileIds
    .map((itemId) => entities.filesById[itemId])
    .filter((file): file is NonNullable<typeof file> => Boolean(file))
  const selectedFolders = selectedFolderIds
    .map((itemId) => entities.foldersById[itemId])
    .filter((folder): folder is NonNullable<typeof folder> => Boolean(folder))
  const selectedContentItemNames = [
    ...selectedFolders.map((folder) => resolveDisplayName(folder.name)),
    ...selectedFiles.map((file) => file.name),
  ]

  const getSelectionTargets = (itemIds: NodeId[]) =>
    activeDataRoomId ? getNormalizedSelectionTargets(entities, itemIds, activeDataRoomId, resolveDisplayName) : null

  const folderSelectionModeMemo = new Map<NodeId, 'none' | 'partial' | 'full'>()
  const getFolderSelectionMode = (folderId: NodeId): 'none' | 'partial' | 'full' => {
    const memoizedValue = folderSelectionModeMemo.get(folderId)
    if (memoizedValue) {
      return memoizedValue
    }

    const folder = entities.foldersById[folderId]
    if (!folder || !isFolderInActiveDataRoom(folderId)) {
      folderSelectionModeMemo.set(folderId, 'none')
      return 'none'
    }

    const selfSelected = isContentItemSelected(folderId)
    let hasAnySelected = selfSelected
    let allDescendantsFullySelected = true

    for (const childFileId of folder.fileIds) {
      const isChildFileSelected = isContentItemSelected(childFileId)
      if (isChildFileSelected) {
        hasAnySelected = true
      } else {
        allDescendantsFullySelected = false
      }
    }

    for (const childFolderId of folder.childFolderIds) {
      const childMode = getFolderSelectionMode(childFolderId)
      if (childMode !== 'none') {
        hasAnySelected = true
      }
      if (childMode !== 'full') {
        allDescendantsFullySelected = false
      }
    }

    const nextMode: 'none' | 'partial' | 'full' = hasAnySelected
      ? allDescendantsFullySelected
        ? 'full'
        : 'partial'
      : 'none'
    folderSelectionModeMemo.set(folderId, nextMode)
    return nextMode
  }

  const indeterminateFolderIds = Object.values(entities.foldersById)
    .filter((folder) => isFolderInActiveDataRoom(folder.id))
    .map((folder) => folder.id)
    .filter((folderId) => getFolderSelectionMode(folderId) === 'partial')
  const checkedFolderIds = Object.values(entities.foldersById)
    .filter((folder) => isActionableFolderInActiveDataRoom(folder.id))
    .map((folder) => folder.id)
    .filter((folderId) => getFolderSelectionMode(folderId) === 'full')
  const checkedContentItemIds = [...checkedFolderIds, ...selectedFileIds]

  const deleteSelectionItemIds = checkedContentItemIds
  const deleteSelectionTargets = getSelectionTargets(deleteSelectionItemIds) ?? EMPTY_SELECTION_TARGETS
  const deleteSelectionSummary = deleteSelectionTargets.topLevelFolderIds.reduce(
    (summary, folderId) => {
      const folderSummary = getFolderDeleteSummary(entities, folderId)
      return {
        folderCount: summary.folderCount + folderSummary.folderCount,
        fileCount: summary.fileCount + folderSummary.fileCount,
      }
    },
    {
      folderCount: 0,
      fileCount: deleteSelectionTargets.standaloneFileIds.length,
    },
  )

  const isContentItemChecked = (itemId: NodeId) => {
    const folder = entities.foldersById[itemId]
    if (folder) {
      return getFolderSelectionMode(folder.id) === 'full'
    }

    const file = entities.filesById[itemId]
    if (!file) {
      return false
    }
    return isFileSelectedByMarks(file.id)
  }

  const toggleContentItemSelection = (itemId: NodeId) => {
    if (!entities.foldersById[itemId] && !entities.filesById[itemId]) {
      return
    }
    const nextMark = isContentItemChecked(itemId) ? 'exclude' : 'include'
    const isFolderToggle = Boolean(entities.foldersById[itemId])

    setIncludedContentItemIds((previous) => {
      const next = new Set(previous)
      if (nextMark === 'include') {
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (markedId !== itemId && isNodeInsideFolder(entities, markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
        next.add(itemId)
      } else {
        next.delete(itemId)
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (isNodeInsideFolder(entities, markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
      }
      return [...next]
    })
    setExcludedContentItemIds((previous) => {
      const next = new Set(previous)
      if (nextMark === 'exclude') {
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (markedId !== itemId && isNodeInsideFolder(entities, markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
        next.add(itemId)
      } else {
        next.delete(itemId)
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (isNodeInsideFolder(entities, markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
      }
      return [...next]
    })
  }

  const toggleAllContentItemSelection = () => {
    const allItemIds = selectableContentItems.map((item) => item.id)
    if (allItemIds.length === 0) {
      return
    }

    const selectedIdSet = new Set(selectableContentItems.map((item) => item.id).filter((itemId) => isContentItemChecked(itemId)))
    const areAllVisibleItemsSelected = allItemIds.every((itemId) => selectedIdSet.has(itemId))
    const mark = areAllVisibleItemsSelected ? 'exclude' : 'include'

    setIncludedContentItemIds((previous) => {
      const next = new Set(previous)
      for (const itemId of allItemIds) {
        if (mark === 'include') {
          next.add(itemId)
        } else {
          next.delete(itemId)
        }
      }
      return [...next]
    })
    setExcludedContentItemIds((previous) => {
      const next = new Set(previous)
      for (const itemId of allItemIds) {
        if (mark === 'exclude') {
          next.add(itemId)
        } else {
          next.delete(itemId)
        }
      }
      return [...next]
    })
  }

  const clearContentItemSelection = () => {
    setIncludedContentItemIds([])
    setExcludedContentItemIds([])
  }

  return {
    selectedContentItemIds,
    checkedContentItemIds,
    selectedContentItemCount: selectedContentItemIds.length,
    selectedContentItemNames,
    indeterminateFolderIds,
    deleteSelectionItemIds,
    deleteSelectionTargets,
    deleteSelectionSummary,
    toggleContentItemSelection,
    toggleAllContentItemSelection,
    clearContentItemSelection,
  }
}
