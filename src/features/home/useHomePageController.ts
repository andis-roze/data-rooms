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
import {
  useMoveContentWorkflow,
} from './hooks/useMoveContentWorkflow'
import { useContentSelection } from './hooks/useContentSelection'
import { useHomePageActions } from './hooks/useHomePageActions'
import { useFeedbackQueue } from './hooks/useFeedbackQueue'
import { loadSortModePreference } from './services/sortPreference'
import type { SortState } from './types'

const EMPTY_DELETE_SUMMARY = { folderCount: 0, fileCount: 0 }

// Main coordinator for home page state, derived view data, and user interaction handlers.
export function useHomePageController(): HomePageViewModel {
  const { t, i18n } = useTranslation()
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

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

  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)
  const [dataRoomNameDraft, setDataRoomNameDraft] = useState('')
  const [dataRoomNameError, setDataRoomNameError] = useState<string | null>(null)
  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)

  const [sortState, setSortState] = useState<SortState>(() => loadSortModePreference())
  const { feedbackQueue, feedbackTimeoutMs, enqueueFeedback, dismissFeedback } = useFeedbackQueue()

  const i18nTranslate = i18n.t as unknown as (key: string, options?: Record<string, unknown>) => string
  const translate = (key: string, options?: Record<string, unknown>): string => i18nTranslate(key, options)

  const resolveDisplayName = (value: string) => (value.startsWith('i18n:') ? translate(value.slice(5)) : value)

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
  const activeDataRoomId = activeDataRoom?.id ?? null
  const locale = i18n.resolvedLanguage ?? i18n.language

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
  const {
    selectedContentItemIds,
    checkedContentItemIds,
    selectedContentItemCount,
    selectedFileCount,
    selectedFolderCount,
    selectedContentItemNames,
    indeterminateFolderIds,
    deleteSelectionItemIds,
    deleteSelectionTargets,
    deleteSelectionSummary,
    toggleContentItemSelection,
    toggleAllContentItemSelection,
    clearContentItemSelection,
  } = useContentSelection({
    entities,
    activeDataRoomId,
    visibleContentItems,
    resolveDisplayName,
  })

  const {
    isMoveContentDialogOpen,
    moveItemCount,
    moveItemNames,
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
    moveItemsToFolder,
  } = useMoveContentWorkflow({
    t: translate,
    entities,
    dispatch,
    activeDataRoom,
    activeFolder,
    selectedContentItemIds,
    resolveDisplayName,
    clearContentItemSelection,
    enqueueFeedback,
  })
  const selectNode = (type: 'dataRoom' | 'folder', id: NodeId) => {
    if (type === 'dataRoom') {
      dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId: id } })
      return
    }

    dispatch({ type: 'dataroom/selectFolder', payload: { folderId: id } })
  }

  const selectDataRoom = (dataRoomId: NodeId) => {
    clearContentItemSelection()
    closeMoveContentDialog()
    endDragMove()
    selectNode('dataRoom', dataRoomId)
  }

  const selectFolder = (folderId: NodeId) => {
    selectNode('folder', folderId)
  }

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
      checkedContentItemIds,
      selectedContentItemCount,
      selectedFileCount,
      selectedFolderCount,
      deleteSelectedContentItemCount: deleteSelectionItemIds.length,
      deleteSelectedFileCount: deleteSelectionSummary.fileCount,
      deleteSelectedFolderCount: deleteSelectionSummary.folderCount,
      selectedContentItemNames,
      indeterminateFolderIds,
      moveItemCount,
      moveItemNames,
      moveDestinationFolderId,
      moveDestinationFolderOptions,
      moveValidationError,
      dragMoveActive: isDragMoveActive,
      dragMoveItemIds,
      dragMoveTargetFolderId,
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
        isMoveContentDialogOpen,
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
      moveItemsToFolder,
    },
  }
}
