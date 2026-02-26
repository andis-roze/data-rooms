import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { HomePageEmptyState } from '../components/page/HomePageEmptyState'
import { HomePageWorkspace } from '../components/page/HomePageWorkspace'
import { FeedbackStack } from '../dialogs/FeedbackStack'
import { useHomePageController } from '../useHomePageController'
import { HomePageDialogsContainer } from './HomePageDialogsContainer'

export function HomePageContainer() {
  const controller = useHomePageController()
  const { t, selection, viewHelpers, uiState, handlerGroups } = controller

  const {
    selectedDataRoomId,
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
    checkedContentItemIds,
    selectedContentItemCount,
    deleteSelectedContentItemCount,
    deleteSelectedFileCount,
    deleteSelectedFolderCount,
    selectedContentItemNames,
    indeterminateFolderIds,
    moveItemCount,
    moveItemNames,
    moveDestinationFolderId,
    moveDestinationFolderOptions,
    moveValidationError,
    dragMoveActive,
    dragMoveTargetFolderId,
    highlightedContentItemId,
    listViewPage,
    listViewPageCount,
    listViewItemsPerPage,
    listViewItemsPerPageOptions,
  } = selection

  const { resolveDisplayName } = viewHelpers
  const { dialogs, forms, uploadInputRef, sortState, feedbackQueue, feedbackTimeoutMs } = uiState

  if (dataRooms.length === 0) {
    return (
      <HomePageEmptyState
        t={t}
        isCreateDialogOpen={dialogs.isCreateDataRoomDialogOpen}
        dataRoomNameDraft={forms.dataRoomNameDraft}
        dataRoomNameError={forms.dataRoomNameError}
        onOpenCreateDialog={handlerGroups.dataRoom.openCreateDataRoomDialog}
        onCloseCreateDialog={handlerGroups.dataRoom.closeCreateDataRoomDialog}
        onDataRoomNameDraftChange={handlerGroups.dataRoom.handleDataRoomNameDraftChange}
        onCreateDataRoom={handlerGroups.dataRoom.handleCreateDataRoom}
      />
    )
  }

  if (!rootFolder || !activeDataRoom || !activeFolder) {
    return <IncompleteStructureState title={t('dataroomStructureIncomplete')} />
  }

  const activeDataRoomName = resolveDisplayName(activeDataRoom.name)
  const activeFolderName = resolveDisplayName(activeFolder.name)
  const sidebarState = {
    dataRooms,
    selectedDataRoomId,
    canDeleteActiveDataRoom,
    resolveDisplayName,
  }
  const sidebarHandlers = {
    onCreateDataRoom: handlerGroups.dataRoom.openCreateDataRoomDialog,
    onRenameDataRoom: handlerGroups.dataRoom.openRenameDataRoomDialog,
    onDeleteDataRoom: handlerGroups.dataRoom.openDeleteDataRoomDialog,
    onSelectDataRoom: handlerGroups.navigation.selectDataRoom,
  }
  const contentState = {
    activeDataRoomName,
    activeFolderId: activeFolder.id,
    breadcrumbs,
    visibleContentItems,
    sortState,
    locale,
    resolveDisplayName,
    checkedContentItemIds,
    selectedContentItemCount,
    deleteSelectedContentItemCount,
    deleteSelectedFileCount,
    deleteSelectedFolderCount,
    selectedContentItemNames,
    indeterminateFolderIds,
    moveContentDialogOpen: dialogs.isMoveContentDialogOpen,
    moveItemCount,
    moveItemNames,
    moveDestinationFolderId,
    moveDestinationFolderOptions,
    moveValidationError,
    dragMoveActive,
    dragMoveTargetFolderId,
    highlightedContentItemId,
    pagination: {
      page: listViewPage,
      pageCount: listViewPageCount,
      itemsPerPage: listViewItemsPerPage,
      itemsPerPageOptions: listViewItemsPerPageOptions,
    },
    deleteSelectedContentDialogOpen: dialogs.isDeleteSelectedContentDialogOpen,
    uploadInputRef,
  }
  const contentHandlers = {
    onCreateFolder: handlerGroups.folder.openCreateFolderDialog,
    onUploadPdf: () => uploadInputRef.current?.click(),
    onUploadInputChange: handlerGroups.file.handleUploadInputChange,
    onUploadDroppedFiles: handlerGroups.file.handleUploadDroppedFiles,
    onUploadDroppedFilesToFolder: handlerGroups.file.handleUploadDroppedFilesToFolder,
    onToggleSort: handlerGroups.list.toggleSort,
    onToggleContentItemSelection: handlerGroups.selection.toggleContentItemSelection,
    onToggleAllContentItemSelection: handlerGroups.selection.toggleAllContentItemSelection,
    onClearContentItemSelection: handlerGroups.selection.clearContentItemSelection,
    onOpenDeleteSelectedContentDialog: handlerGroups.selection.openDeleteSelectedContentDialog,
    onCloseDeleteSelectedContentDialog: handlerGroups.selection.closeDeleteSelectedContentDialog,
    onDeleteSelectedContent: handlerGroups.selection.handleDeleteSelectedContent,
    onOpenMoveSelectedContentDialog: handlerGroups.move.openMoveSelectedContentDialog,
    onCloseMoveContentDialog: handlerGroups.move.closeMoveContentDialog,
    onMoveDestinationFolderChange: handlerGroups.move.handleMoveDestinationFolderChange,
    onMoveSelectedContent: handlerGroups.move.handleMoveSelectedContent,
    onStartDragMove: handlerGroups.move.startDragMove,
    onEndDragMove: handlerGroups.move.endDragMove,
    onSetDragMoveTargetFolder: handlerGroups.move.setDragMoveTargetFolder,
    onCanDropOnFolder: handlerGroups.move.canDropOnFolder,
    onDropOnFolder: handlerGroups.move.dropOnFolder,
    pagination: {
      onPageChange: handlerGroups.list.handleListViewPageChange,
      onItemsPerPageChange: handlerGroups.list.handleListViewItemsPerPageChange,
    },
    onSelectFolder: handlerGroups.navigation.selectFolder,
    onOpenRenameFolder: handlerGroups.folder.openRenameFolderDialog,
    onOpenDeleteFolder: handlerGroups.folder.openDeleteFolderDialog,
    onOpenMoveFolder: handlerGroups.move.openMoveFolderDialog,
    onOpenViewFile: handlerGroups.file.openViewFileDialog,
    onOpenRenameFile: handlerGroups.file.openRenameFileDialog,
    onOpenDeleteFile: handlerGroups.file.openDeleteFileDialog,
    onOpenMoveFile: handlerGroups.move.openMoveFileDialog,
  }

  return (
    <HomePageWorkspace
      sidebarState={sidebarState}
      sidebarHandlers={sidebarHandlers}
      contentState={contentState}
      contentHandlers={contentHandlers}
    >
      <HomePageDialogsContainer
        dialogs={dialogs}
        forms={forms}
        activeDataRoomName={activeDataRoomName}
        activeFolderName={activeFolderName}
        targetFolder={targetFolder}
        activeFile={activeFile}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        folderDeleteSummary={folderDeleteSummary}
        resolveDisplayName={resolveDisplayName}
        handlers={handlerGroups}
      />

      <FeedbackStack
        feedbackQueue={feedbackQueue}
        timeoutMs={feedbackTimeoutMs}
        onDismissFeedback={handlerGroups.feedback.dismissFeedback}
      />
    </HomePageWorkspace>
  )
}
