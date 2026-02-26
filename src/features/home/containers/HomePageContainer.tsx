import { IncompleteStructureState } from '../components/IncompleteStructureState'
import { HomePageEmptyState } from '../components/page/HomePageEmptyState'
import { HomePageWorkspace } from '../components/page/HomePageWorkspace'
import { FeedbackStack } from '../dialogs/FeedbackStack'
import { useHomePageController } from '../useHomePageController'
import { HomePageDialogsContainer } from './HomePageDialogsContainer'

export function HomePageContainer() {
  const controller = useHomePageController()
  const { t, entities, selection, viewHelpers, uiState, handlers } = controller

  const {
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
    dragMoveItemIds,
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
        onOpenCreateDialog={handlers.openCreateDataRoomDialog}
        onCloseCreateDialog={handlers.closeCreateDataRoomDialog}
        onDataRoomNameDraftChange={handlers.handleDataRoomNameDraftChange}
        onCreateDataRoom={handlers.handleCreateDataRoom}
      />
    )
  }

  if (!rootFolder || !activeDataRoom || !activeFolder) {
    return <IncompleteStructureState title={t('dataroomStructureIncomplete')} />
  }

  const activeDataRoomName = resolveDisplayName(activeDataRoom.name)
  const activeFolderName = resolveDisplayName(activeFolder.name)

  return (
    <HomePageWorkspace
      sidebarState={{
        entities,
        dataRooms,
        selectedDataRoomId,
        selectedFolderId,
        selectedContentItemIds,
        checkedContentItemIds,
        indeterminateFolderIds,
        dragMoveActive,
        dragMoveItemIds,
        dragMoveTargetFolderId,
        canDeleteActiveDataRoom,
        resolveDisplayName,
      }}
      sidebarHandlers={{
        onCreateDataRoom: handlers.openCreateDataRoomDialog,
        onRenameDataRoom: handlers.openRenameDataRoomDialog,
        onDeleteDataRoom: handlers.openDeleteDataRoomDialog,
        onSelectDataRoom: handlers.selectDataRoom,
        onSelectFolder: handlers.selectFolder,
        onOpenMoveFolder: handlers.openMoveFolderDialog,
        onOpenRenameFolder: handlers.openRenameFolderDialog,
        onOpenDeleteFolder: handlers.openDeleteFolderDialog,
        onToggleContentItemSelection: handlers.toggleContentItemSelection,
        onStartDragMove: handlers.startDragMove,
        onEndDragMove: handlers.endDragMove,
        onSetDragMoveTargetFolder: handlers.setDragMoveTargetFolder,
        onCanDropOnFolder: handlers.canDropOnFolder,
        onMoveItemsToFolder: handlers.moveItemsToFolder,
      }}
      contentState={{
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
        listViewPage,
        listViewPageCount,
        listViewItemsPerPage,
        listViewItemsPerPageOptions,
        deleteSelectedContentDialogOpen: dialogs.isDeleteSelectedContentDialogOpen,
        uploadInputRef,
      }}
      contentHandlers={{
        onCreateFolder: handlers.openCreateFolderDialog,
        onUploadPdf: () => uploadInputRef.current?.click(),
        onUploadInputChange: handlers.handleUploadInputChange,
        onToggleSort: handlers.toggleSort,
        onToggleContentItemSelection: handlers.toggleContentItemSelection,
        onToggleAllContentItemSelection: handlers.toggleAllContentItemSelection,
        onClearContentItemSelection: handlers.clearContentItemSelection,
        onOpenDeleteSelectedContentDialog: handlers.openDeleteSelectedContentDialog,
        onCloseDeleteSelectedContentDialog: handlers.closeDeleteSelectedContentDialog,
        onDeleteSelectedContent: handlers.handleDeleteSelectedContent,
        onOpenMoveSelectedContentDialog: handlers.openMoveSelectedContentDialog,
        onCloseMoveContentDialog: handlers.closeMoveContentDialog,
        onMoveDestinationFolderChange: handlers.handleMoveDestinationFolderChange,
        onMoveSelectedContent: handlers.handleMoveSelectedContent,
        onStartDragMove: handlers.startDragMove,
        onEndDragMove: handlers.endDragMove,
        onSetDragMoveTargetFolder: handlers.setDragMoveTargetFolder,
        onCanDropOnFolder: handlers.canDropOnFolder,
        onDropOnFolder: handlers.dropOnFolder,
        onListViewPageChange: handlers.handleListViewPageChange,
        onListViewItemsPerPageChange: handlers.handleListViewItemsPerPageChange,
        onSelectFolder: handlers.selectFolder,
        onOpenRenameFolder: handlers.openRenameFolderDialog,
        onOpenDeleteFolder: handlers.openDeleteFolderDialog,
        onOpenMoveFolder: handlers.openMoveFolderDialog,
        onOpenViewFile: handlers.openViewFileDialog,
        onOpenRenameFile: handlers.openRenameFileDialog,
        onOpenDeleteFile: handlers.openDeleteFileDialog,
        onOpenMoveFile: handlers.openMoveFileDialog,
      }}
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
        handlers={handlers}
      />

      <FeedbackStack
        feedbackQueue={feedbackQueue}
        timeoutMs={feedbackTimeoutMs}
        onDismissFeedback={handlers.dismissFeedback}
      />
    </HomePageWorkspace>
  )
}
