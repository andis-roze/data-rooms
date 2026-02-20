import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  deleteManyFileBlobs,
  getDataRoomDeleteSummary,
  getFileIdsForFolderCascadeDelete,
  getFolderDeleteSummary,
  normalizeNodeName,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'
import {
  selectActiveDataRoom,
  selectActiveFolder,
  selectBreadcrumbs,
  selectDataRooms,
  selectRootFolder,
  selectVisibleContentItems,
} from './selectors/homeSelectors'
import type { HomePageViewModel } from './model/homePageViewModel'
import { useHomePageActions } from './hooks/useHomePageActions'
import { loadFeedbackTimeoutMs } from './services/feedback'
import { loadSortModePreference } from './services/sortPreference'
import type { FeedbackState, SortState } from './types'

const EMPTY_DELETE_SUMMARY = { folderCount: 0, fileCount: 0 }

// Main coordinator for home page state, derived view data, and user interaction handlers.
export function useHomePageController(): HomePageViewModel {
  const { t, i18n } = useTranslation()
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const feedbackIdRef = useRef(0)

  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false)
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false)
  const [isCreateDataRoomDialogOpen, setIsCreateDataRoomDialogOpen] = useState(false)
  const [isRenameDataRoomDialogOpen, setIsRenameDataRoomDialogOpen] = useState(false)
  const [isDeleteDataRoomDialogOpen, setIsDeleteDataRoomDialogOpen] = useState(false)
  const [isRenameFileDialogOpen, setIsRenameFileDialogOpen] = useState(false)
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false)
  const [isViewFileDialogOpen, setIsViewFileDialogOpen] = useState(false)
  const [isDeleteSelectedContentDialogOpen, setIsDeleteSelectedContentDialogOpen] = useState(false)

  const [targetFolderId, setTargetFolderId] = useState<NodeId | null>(null)
  const [activeFileId, setActiveFileId] = useState<NodeId | null>(null)
  const [includedContentItemIds, setIncludedContentItemIds] = useState<NodeId[]>([])
  const [excludedContentItemIds, setExcludedContentItemIds] = useState<NodeId[]>([])

  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)
  const [dataRoomNameDraft, setDataRoomNameDraft] = useState('')
  const [dataRoomNameError, setDataRoomNameError] = useState<string | null>(null)
  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)

  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackState[]>([])
  const [sortState, setSortState] = useState<SortState>(() => loadSortModePreference())
  const feedbackTimeoutMs = loadFeedbackTimeoutMs()

  const i18nTranslate = i18n.t as unknown as (key: string, options?: Record<string, unknown>) => string
  const translate = (key: string, options?: Record<string, unknown>): string => i18nTranslate(key, options)

  const resolveDisplayName = (value: string) => (value.startsWith('i18n:') ? translate(value.slice(5)) : value)

  const enqueueFeedback = (message: string, severity: FeedbackState['severity']) => {
    setFeedbackQueue((previous) => [...previous, { id: feedbackIdRef.current++, message, severity }])
  }

  const dismissFeedback = (id: number) => {
    setFeedbackQueue((previous) => previous.filter((item) => item.id !== id))
  }

  const hasDuplicateDataRoomDisplayName = (candidateName: string, excludeDataRoomId?: NodeId) => {
    const normalizedCandidate = normalizeNodeName(candidateName)

    return entities.dataRoomOrder.some((dataRoomId) => {
      if (excludeDataRoomId && dataRoomId === excludeDataRoomId) {
        return false
      }

      const dataRoom = entities.dataRoomsById[dataRoomId]
      if (!dataRoom) {
        return false
      }

      return normalizeNodeName(resolveDisplayName(dataRoom.name)) === normalizedCandidate
    })
  }

  const dataRooms = selectDataRooms(entities)
  const activeDataRoom = selectActiveDataRoom(entities, selectedDataRoomId, dataRooms)
  const rootFolder = selectRootFolder(entities, activeDataRoom)
  const activeFolder = selectActiveFolder(entities, rootFolder, selectedFolderId)
  const breadcrumbs = selectBreadcrumbs(entities, activeFolder)
  const visibleContentItems = selectVisibleContentItems(entities, activeFolder, resolveDisplayName, sortState)
  const locale = i18n.resolvedLanguage ?? i18n.language
  const selectableContentItems = visibleContentItems.filter(
    (item) => !(item.kind === 'folder' && item.isParentNavigation),
  )

  const canDeleteActiveDataRoom = Boolean(activeDataRoom)
  const dataRoomDeleteSummary = activeDataRoom
    ? getDataRoomDeleteSummary(entities, activeDataRoom.id)
    : EMPTY_DELETE_SUMMARY

  const getFolderById = (folderId: NodeId | null) => (folderId ? entities.foldersById[folderId] ?? null : null)
  const getFileById = (fileId: NodeId | null) => (fileId ? entities.filesById[fileId] ?? null : null)

  const targetFolder = getFolderById(targetFolderId)
  const folderDeleteSummary = activeFolder
    ? getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
    : EMPTY_DELETE_SUMMARY
  const activeFile = getFileById(activeFileId)

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
  const isFolderInActiveDataRoom = (folderId: NodeId) => {
    const folder = entities.foldersById[folderId]
    return Boolean(folder && activeDataRoom && folder.dataRoomId === activeDataRoom.id)
  }
  const isFileInActiveDataRoom = (fileId: NodeId) => {
    const file = entities.filesById[fileId]
    if (!file || !activeDataRoom) {
      return false
    }

    const parentFolder = entities.foldersById[file.parentFolderId]
    return parentFolder?.dataRoomId === activeDataRoom.id
  }
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
    .filter((folder) => isFolderInActiveDataRoom(folder.id))
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
  const hasSelectedFolderAncestor = (folderId: NodeId, selectedFolderIdSet: Set<NodeId>) => {
    let currentFolder = entities.foldersById[folderId]
    while (currentFolder?.parentFolderId) {
      if (selectedFolderIdSet.has(currentFolder.parentFolderId)) {
        return true
      }
      currentFolder = entities.foldersById[currentFolder.parentFolderId]
    }
    return false
  }
  const explicitSelectedFolderIdSet = new Set(selectedFolders.map((folder) => folder.id))
  const topLevelSelectedFolderIds = selectedFolders
    .map((folder) => folder.id)
    .filter((folderId) => !hasSelectedFolderAncestor(folderId, explicitSelectedFolderIdSet))
  const topLevelSelectedFolderIdSet = new Set(topLevelSelectedFolderIds)
  const selectedContentItemNames = [
    ...selectedFolders.map((folder) => resolveDisplayName(folder.name)),
    ...selectedFiles.map((file) => file.name),
  ]

  const selectNode = (type: 'dataRoom' | 'folder', id: NodeId) => {
    if (type === 'dataRoom') {
      dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId: id } })
      return
    }

    dispatch({ type: 'dataroom/selectFolder', payload: { folderId: id } })
  }

  const selectDataRoom = (dataRoomId: NodeId) => {
    setIncludedContentItemIds([])
    setExcludedContentItemIds([])
    selectNode('dataRoom', dataRoomId)
  }

  const selectFolder = (folderId: NodeId) => {
    selectNode('folder', folderId)
  }

  const toggleContentItemSelection = (itemId: NodeId) => {
    if (!entities.foldersById[itemId] && !entities.filesById[itemId]) {
      return
    }
    const nextMark = isContentItemSelected(itemId) ? 'exclude' : 'include'
    const isNodeInsideFolder = (nodeId: NodeId, folderId: NodeId) => {
      const folder = entities.foldersById[nodeId]
      if (folder) {
        let currentFolder: NodeId | null = folder.id
        while (currentFolder) {
          if (currentFolder === folderId) {
            return true
          }
          currentFolder = entities.foldersById[currentFolder]?.parentFolderId ?? null
        }
        return false
      }

      const file = entities.filesById[nodeId]
      if (!file) {
        return false
      }

      let currentFolderId: NodeId | null = file.parentFolderId
      while (currentFolderId) {
        if (currentFolderId === folderId) {
          return true
        }
        currentFolderId = entities.foldersById[currentFolderId]?.parentFolderId ?? null
      }

      return false
    }
    const isFolderToggle = Boolean(entities.foldersById[itemId])

    setIncludedContentItemIds((previous) => {
      const next = new Set(previous)
      if (nextMark === 'include') {
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (markedId !== itemId && isNodeInsideFolder(markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
        next.add(itemId)
      } else {
        next.delete(itemId)
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (isNodeInsideFolder(markedId, itemId)) {
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
            if (markedId !== itemId && isNodeInsideFolder(markedId, itemId)) {
              next.delete(markedId)
            }
          }
        }
        next.add(itemId)
      } else {
        next.delete(itemId)
        if (isFolderToggle) {
          for (const markedId of [...next]) {
            if (isNodeInsideFolder(markedId, itemId)) {
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
    const selectedIdSet = new Set(selectableContentItems.map((item) => item.id).filter((itemId) => isContentItemSelected(itemId)))
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

  const openDeleteSelectedContentDialog = () => {
    if (selectedContentItemIds.length > 0) {
      setIsDeleteSelectedContentDialogOpen(true)
    }
  }

  const closeDeleteSelectedContentDialog = () => {
    setIsDeleteSelectedContentDialogOpen(false)
  }

  const handleDeleteSelectedContent = async () => {
    if (selectedContentItemIds.length === 0) {
      return
    }
    const isFileInsideSelectedFolder = (folderId: NodeId) => {
      let currentFolder: NodeId | null = folderId
      while (currentFolder) {
        if (topLevelSelectedFolderIdSet.has(currentFolder)) {
          return true
        }
        currentFolder = entities.foldersById[currentFolder]?.parentFolderId ?? null
      }
      return false
    }

    const selectedStandaloneFileIds = selectedFiles
      .map((file) => file)
      .filter((file) => !isFileInsideSelectedFolder(file.parentFolderId))
      .map((file) => file.id)

    for (const fileId of selectedStandaloneFileIds) {
      dispatch({ type: 'dataroom/deleteFile', payload: { fileId } })
    }

    for (const folderId of topLevelSelectedFolderIds) {
      dispatch({ type: 'dataroom/deleteFolder', payload: { folderId } })
    }

    const fileIdsForCleanup = new Set<NodeId>(selectedStandaloneFileIds)
    for (const folderId of topLevelSelectedFolderIds) {
      const nestedFileIds = getFileIdsForFolderCascadeDelete(entities, folderId)
      for (const fileId of nestedFileIds) {
        fileIdsForCleanup.add(fileId)
      }
    }

    setIsDeleteSelectedContentDialogOpen(false)
    setIncludedContentItemIds([])
    setExcludedContentItemIds([])
    enqueueFeedback(t('dataroomFeedbackSelectedItemsDeleted'), 'success')

    try {
      await deleteManyFileBlobs([...fileIdsForCleanup])
    } catch {
      // Best-effort cleanup only.
    }
  }

  const actions = useHomePageActions({
    dataRoom: {
      t: translate,
      entities,
      dispatch,
      activeDataRoom,
      dataRoomNameDraft,
      resolveDisplayName,
      hasDuplicateDataRoomDisplayName,
      enqueueFeedback,
      setDataRoomNameDraft,
      setDataRoomNameError,
      setIsCreateDataRoomDialogOpen,
      setIsRenameDataRoomDialogOpen,
      setIsDeleteDataRoomDialogOpen,
    },
    folder: {
      t: translate,
      entities,
      dispatch,
      activeDataRoom,
      activeFolder,
      targetFolder,
      folderNameDraft,
      resolveDisplayName,
      enqueueFeedback,
      setFolderNameDraft,
      setFolderNameError,
      setTargetFolderId,
      setIsCreateFolderDialogOpen,
      setIsRenameFolderDialogOpen,
      setIsDeleteFolderDialogOpen,
    },
    file: {
      t: translate,
      entities,
      dispatch,
      activeFolder,
      activeFile,
      fileNameDraft,
      enqueueFeedback,
      setActiveFileId,
      setFileNameDraft,
      setFileNameError,
      setIsRenameFileDialogOpen,
      setIsDeleteFileDialogOpen,
      setIsViewFileDialogOpen,
    },
    sort: {
      sortState,
      setSortState,
    },
  })

  return {
    t,
    entities,
    selection: {
      selectedDataRoomId,
      selectedFolderId,
      dataRooms,
      activeDataRoom,
      rootFolder,
      activeFolder,
      breadcrumbs,
      visibleContentItems,
      locale,
      targetFolder,
      activeFile,
      canDeleteActiveDataRoom,
      dataRoomDeleteSummary,
      folderDeleteSummary,
      selectedContentItemIds,
      selectedContentItemCount: selectedContentItemIds.length,
      selectedFileCount: selectedFiles.length,
      selectedFolderCount: selectedFolders.length,
      selectedContentItemNames,
    },
    viewHelpers: {
      resolveDisplayName,
    },
    uiState: {
      uploadInputRef,
      sortState,
      feedbackTimeoutMs,
      feedbackQueue,
      dialogs: {
        isCreateDataRoomDialogOpen,
        isRenameDataRoomDialogOpen,
        isDeleteDataRoomDialogOpen,
        isCreateFolderDialogOpen,
        isRenameFolderDialogOpen,
        isDeleteFolderDialogOpen,
        isRenameFileDialogOpen,
        isDeleteFileDialogOpen,
        isViewFileDialogOpen,
        isDeleteSelectedContentDialogOpen,
      },
      forms: {
        dataRoomNameDraft,
        dataRoomNameError,
        folderNameDraft,
        folderNameError,
        fileNameDraft,
        fileNameError,
      },
    },
    handlers: {
      ...actions,
      dismissFeedback,
      selectDataRoom,
      selectFolder,
      toggleContentItemSelection,
      toggleAllContentItemSelection,
      clearContentItemSelection,
      openDeleteSelectedContentDialog,
      closeDeleteSelectedContentDialog,
      handleDeleteSelectedContent,
    },
  }
}
