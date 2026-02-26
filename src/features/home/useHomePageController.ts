import { useTranslation } from 'react-i18next'
import { type NodeId } from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'
import type { HomePageHandlers, HomePageViewModel } from './model/homePageViewModel'
import { useMoveContentWorkflow } from './hooks/useMoveContentWorkflow'
import { useContentSelection } from './hooks/useContentSelection'
import { useHomePageActions } from './hooks/useHomePageActions'
import { useHomePageActionGroups } from './hooks/useHomePageActionGroups'
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
import { useHomePageSelectionState } from './hooks/useHomePageSelectionState'
import { useHomePagePaginationState } from './hooks/useHomePagePaginationState'

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

  const {
    dataRooms,
    activeDataRoom,
    rootFolder,
    activeFolder,
    breadcrumbs,
    visibleContentItems,
    activeDataRoomId,
    locale,
    targetFolder,
    activeFile,
    canDeleteActiveDataRoom,
    dataRoomDeleteSummary,
    folderDeleteSummary,
  } = useHomePageSelectionState({
    entities,
    selectedDataRoomId,
    selectedFolderId,
    sortState,
    targetFolderId,
    activeFileId,
    resolvedLanguage: i18n.resolvedLanguage,
    language: i18n.language,
  })

  const { listViewPageCount, resolvedListViewPage, pagedContentItems } = useHomePagePaginationState({
    visibleContentItems,
    listViewPage,
    listViewItemsPerPage,
    activeFolderId: activeFolder?.id ?? null,
    setListViewPage,
  })
  const {
    selectedContentItemIds,
    checkedContentItemIds,
    selectedContentItemCount,
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
    visibleContentItems: pagedContentItems,
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

  const handleUploadDroppedFiles = async (files: File[]) => {
    await actions.handleUploadFiles(files)
  }

  const handleUploadDroppedFilesToFolder = async (folderId: NodeId, files: File[]) => {
    await actions.handleUploadFiles(files, { parentFolderId: folderId })
  }

  const handlers: HomePageHandlers = {
    ...actions,
    handleUploadDroppedFiles,
    handleUploadDroppedFilesToFolder,
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
    handleListViewPageChange,
    handleListViewItemsPerPageChange,
  }

  const handlerGroups = useHomePageActionGroups(handlers)

  return {
    t,
    selection: {
      selectedDataRoomId,
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
      checkedContentItemIds,
      selectedContentItemCount,
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
    handlers,
    handlerGroups,
  }
}
