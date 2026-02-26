import { useMemo } from 'react'
import type { HomePageHandlerGroups, HomePageHandlers } from '../model/homePageViewModel'

export function useHomePageActionGroups(handlers: HomePageHandlers): HomePageHandlerGroups {
  return useMemo(
    () => ({
      dataRoom: {
        openCreateDataRoomDialog: handlers.openCreateDataRoomDialog,
        openRenameDataRoomDialog: handlers.openRenameDataRoomDialog,
        openDeleteDataRoomDialog: handlers.openDeleteDataRoomDialog,
        closeCreateDataRoomDialog: handlers.closeCreateDataRoomDialog,
        closeRenameDataRoomDialog: handlers.closeRenameDataRoomDialog,
        closeDeleteDataRoomDialog: handlers.closeDeleteDataRoomDialog,
        handleDataRoomNameDraftChange: handlers.handleDataRoomNameDraftChange,
        handleCreateDataRoom: handlers.handleCreateDataRoom,
        handleRenameDataRoom: handlers.handleRenameDataRoom,
        handleDeleteDataRoom: handlers.handleDeleteDataRoom,
      },
      folder: {
        handleFolderNameDraftChange: handlers.handleFolderNameDraftChange,
        openCreateFolderDialog: handlers.openCreateFolderDialog,
        closeCreateFolderDialog: handlers.closeCreateFolderDialog,
        openRenameFolderDialog: handlers.openRenameFolderDialog,
        closeRenameFolderDialog: handlers.closeRenameFolderDialog,
        openDeleteFolderDialog: handlers.openDeleteFolderDialog,
        closeDeleteFolderDialog: handlers.closeDeleteFolderDialog,
        handleCreateFolder: handlers.handleCreateFolder,
        handleRenameFolder: handlers.handleRenameFolder,
        handleDeleteFolder: handlers.handleDeleteFolder,
      },
      file: {
        handleFileNameDraftChange: handlers.handleFileNameDraftChange,
        openRenameFileDialog: handlers.openRenameFileDialog,
        closeRenameFileDialog: handlers.closeRenameFileDialog,
        openDeleteFileDialog: handlers.openDeleteFileDialog,
        closeDeleteFileDialog: handlers.closeDeleteFileDialog,
        openViewFileDialog: handlers.openViewFileDialog,
        closeViewFileDialog: handlers.closeViewFileDialog,
        handleUploadInputChange: handlers.handleUploadInputChange,
        handleUploadDroppedFiles: handlers.handleUploadDroppedFiles,
        handleUploadDroppedFilesToFolder: handlers.handleUploadDroppedFilesToFolder,
        handleRenameFile: handlers.handleRenameFile,
        handleDeleteFile: handlers.handleDeleteFile,
      },
      selection: {
        toggleContentItemSelection: handlers.toggleContentItemSelection,
        toggleAllContentItemSelection: handlers.toggleAllContentItemSelection,
        clearContentItemSelection: handlers.clearContentItemSelection,
        openDeleteSelectedContentDialog: handlers.openDeleteSelectedContentDialog,
        closeDeleteSelectedContentDialog: handlers.closeDeleteSelectedContentDialog,
        handleDeleteSelectedContent: handlers.handleDeleteSelectedContent,
      },
      move: {
        openMoveSelectedContentDialog: handlers.openMoveSelectedContentDialog,
        openMoveFolderDialog: handlers.openMoveFolderDialog,
        openMoveFileDialog: handlers.openMoveFileDialog,
        closeMoveContentDialog: handlers.closeMoveContentDialog,
        handleMoveDestinationFolderChange: handlers.handleMoveDestinationFolderChange,
        handleMoveSelectedContent: handlers.handleMoveSelectedContent,
        startDragMove: handlers.startDragMove,
        endDragMove: handlers.endDragMove,
        setDragMoveTargetFolder: handlers.setDragMoveTargetFolder,
        canDropOnFolder: handlers.canDropOnFolder,
        dropOnFolder: handlers.dropOnFolder,
      },
      list: {
        handleListViewPageChange: handlers.handleListViewPageChange,
        handleListViewItemsPerPageChange: handlers.handleListViewItemsPerPageChange,
        toggleSort: handlers.toggleSort,
      },
      navigation: {
        selectDataRoom: handlers.selectDataRoom,
        selectFolder: handlers.selectFolder,
      },
      feedback: {
        dismissFeedback: handlers.dismissFeedback,
      },
    }),
    [handlers],
  )
}
