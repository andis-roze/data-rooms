import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import {
  getDataRoomDeleteSummary,
  getFolderDeleteSummary,
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
import { useMoveContentWorkflow } from './hooks/useMoveContentWorkflow'
import { useContentSelection } from './hooks/useContentSelection'
import { useHomePageActions } from './hooks/useHomePageActions'
import { useFeedbackQueue } from './hooks/useFeedbackQueue'
import {
  useHomePageDialogState,
  useHomePageFormState,
  useHomePageTransientState,
} from './hooks/useHomePageUiState'
import { useHomePageViewHelpers } from './hooks/useHomePageViewHelpers'
import { defaultFileBlobStorageService } from './services/fileBlobStorage'
import { useDeleteSelectedContent } from './hooks/useDeleteSelectedContent'
import { LIST_VIEW_ITEMS_PER_PAGE_OPTIONS } from './config/pagination'

const EMPTY_DELETE_SUMMARY = { folderCount: 0, fileCount: 0 }

// Main coordinator for home page state, derived view data, and user interaction handlers.
export function useHomePageController(): HomePageViewModel {
  const { t, i18n } = useTranslation()
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()

  const dialogs = useHomePageDialogState()
  const forms = useHomePageFormState()
  const transientState = useHomePageTransientState()

  const {
    uploadInputRef,
    targetFolderId,
    setTargetFolderId,
    activeFileId,
    setActiveFileId,
    highlightedContentItemId,
    setHighlightedContentItemId,
    listViewPage,
    setListViewPage,
    listViewItemsPerPage,
    setListViewItemsPerPage,
    sortState,
    setSortState,
  } = transientState

  const {
    isCreateFolderDialogOpen,
    setIsCreateFolderDialogOpen,
    isRenameFolderDialogOpen,
    setIsRenameFolderDialogOpen,
    isDeleteFolderDialogOpen,
    setIsDeleteFolderDialogOpen,
    isCreateDataRoomDialogOpen,
    setIsCreateDataRoomDialogOpen,
    isRenameDataRoomDialogOpen,
    setIsRenameDataRoomDialogOpen,
    isDeleteDataRoomDialogOpen,
    setIsDeleteDataRoomDialogOpen,
    isRenameFileDialogOpen,
    setIsRenameFileDialogOpen,
    isDeleteFileDialogOpen,
    setIsDeleteFileDialogOpen,
    isViewFileDialogOpen,
    setIsViewFileDialogOpen,
    isDeleteSelectedContentDialogOpen,
    setIsDeleteSelectedContentDialogOpen,
  } = dialogs

  const {
    folderNameDraft,
    setFolderNameDraft,
    folderNameError,
    setFolderNameError,
    dataRoomNameDraft,
    setDataRoomNameDraft,
    dataRoomNameError,
    setDataRoomNameError,
    fileNameDraft,
    setFileNameDraft,
    fileNameError,
    setFileNameError,
  } = forms

  const { feedbackQueue, feedbackTimeoutMs, enqueueFeedback, dismissFeedback } = useFeedbackQueue()

  const i18nTranslate = i18n.t as unknown as (key: string, options?: Record<string, unknown>) => string
  const translate = (key: string, options?: Record<string, unknown>): string => i18nTranslate(key, options)

  const { resolveDisplayName, hasDuplicateDataRoomDisplayName } = useHomePageViewHelpers({
    entities,
    translate,
  })

  const dataRooms = selectDataRooms(entities)
  const activeDataRoom = selectActiveDataRoom(entities, selectedDataRoomId, dataRooms)
  const rootFolder = selectRootFolder(entities, activeDataRoom)
  const activeFolder = selectActiveFolder(entities, rootFolder, selectedFolderId)
  const breadcrumbs = selectBreadcrumbs(entities, activeFolder)
  const visibleContentItems = selectVisibleContentItems(entities, activeFolder, resolveDisplayName, sortState)
  const parentNavigationItem = visibleContentItems.find((item) => item.kind === 'folder' && item.isParentNavigation)
  const pageableContentItems = visibleContentItems.filter((item) => !(item.kind === 'folder' && item.isParentNavigation))
  const listViewPageCount = Math.max(1, Math.ceil(pageableContentItems.length / listViewItemsPerPage))
  const resolvedListViewPage = Math.min(listViewPage, listViewPageCount - 1)
  const pageStart = resolvedListViewPage * listViewItemsPerPage
  const pageEnd = pageStart + listViewItemsPerPage
  const pageItems = pageableContentItems.slice(pageStart, pageEnd)
  const pagedContentItems = parentNavigationItem ? [parentNavigationItem, ...pageItems] : pageItems
  const activeDataRoomId = activeDataRoom?.id ?? null
  const locale = i18n.resolvedLanguage ?? i18n.language

  useEffect(() => {
    if (listViewPage !== resolvedListViewPage) {
      setListViewPage(resolvedListViewPage)
    }
  }, [listViewPage, resolvedListViewPage, setListViewPage])

  useEffect(() => {
    setListViewPage(0)
  }, [activeFolder?.id, listViewItemsPerPage, setListViewPage])

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
    setHighlightedContentItemId(null)
    clearContentItemSelection()
    closeMoveContentDialog()
    endDragMove()
    selectNode('dataRoom', dataRoomId)
  }

  const selectFolder = (folderId: NodeId) => {
    setHighlightedContentItemId(null)
    selectNode('folder', folderId)
  }

  const handleListViewPageChange = (page: number) => {
    setListViewPage(page)
  }

  const handleListViewItemsPerPageChange = (itemsPerPage: number) => {
    setListViewItemsPerPage(itemsPerPage)
    setListViewPage(0)
  }

  const {
    openDeleteSelectedContentDialog,
    closeDeleteSelectedContentDialog,
    handleDeleteSelectedContent,
  } = useDeleteSelectedContent({
    t: translate,
    entities,
    dispatch,
    fileBlobStorage: defaultFileBlobStorageService,
    deleteSelectionItemIds,
    deleteSelectionTargets,
    clearContentItemSelection,
    enqueueFeedback,
    setIsDeleteSelectedContentDialogOpen,
  })

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
      fileBlobStorage: defaultFileBlobStorageService,
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
      setHighlightedContentItemId,
      fileBlobStorage: defaultFileBlobStorageService,
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
      setHighlightedContentItemId,
      fileBlobStorage: defaultFileBlobStorageService,
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
      visibleContentItems: pagedContentItems,
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
      highlightedContentItemId,
      listViewPage: resolvedListViewPage,
      listViewPageCount,
      listViewItemsPerPage,
      listViewItemsPerPageOptions: [...LIST_VIEW_ITEMS_PER_PAGE_OPTIONS],
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
      handleListViewPageChange,
      handleListViewItemsPerPageChange,
    },
  }
}
