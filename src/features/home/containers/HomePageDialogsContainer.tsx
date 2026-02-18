import type { FileNode, Folder } from '../../dataroom/model'
import { HomeDialogs } from '../HomeDialogs'

// Maps controller state/handlers into the flattened HomeDialogs props.
interface HomePageDialogsContainerProps {
  dialogs: {
    isCreateDataRoomDialogOpen: boolean
    isRenameDataRoomDialogOpen: boolean
    isDeleteDataRoomDialogOpen: boolean
    isCreateFolderDialogOpen: boolean
    isRenameFolderDialogOpen: boolean
    isDeleteFolderDialogOpen: boolean
    isRenameFileDialogOpen: boolean
    isDeleteFileDialogOpen: boolean
    isViewFileDialogOpen: boolean
  }
  forms: {
    dataRoomNameDraft: string
    dataRoomNameError: string | null
    folderNameDraft: string
    folderNameError: string | null
    fileNameDraft: string
    fileNameError: string | null
  }
  activeDataRoomName: string
  activeFolderName: string
  targetFolder: Folder | null
  activeFile: FileNode | null
  dataRoomDeleteSummary: { folderCount: number; fileCount: number }
  folderDeleteSummary: { folderCount: number; fileCount: number }
  resolveDisplayName: (value: string) => string
  handlers: {
    closeCreateDataRoomDialog: () => void
    handleDataRoomNameDraftChange: (value: string) => void
    handleCreateDataRoom: () => void
    closeRenameDataRoomDialog: () => void
    handleRenameDataRoom: () => void
    closeDeleteDataRoomDialog: () => void
    handleDeleteDataRoom: () => void
    closeCreateFolderDialog: () => void
    handleFolderNameDraftChange: (value: string) => void
    handleCreateFolder: () => void
    closeRenameFolderDialog: () => void
    handleRenameFolder: () => void
    closeDeleteFolderDialog: () => void
    handleDeleteFolder: () => void
    closeRenameFileDialog: () => void
    handleFileNameDraftChange: (value: string) => void
    handleRenameFile: () => void
    closeDeleteFileDialog: () => void
    handleDeleteFile: () => void
    closeViewFileDialog: () => void
  }
}

export function HomePageDialogsContainer({
  dialogs,
  forms,
  activeDataRoomName,
  activeFolderName,
  targetFolder,
  activeFile,
  dataRoomDeleteSummary,
  folderDeleteSummary,
  resolveDisplayName,
  handlers,
}: HomePageDialogsContainerProps) {
  return (
    <HomeDialogs
      createDataRoomDialogOpen={dialogs.isCreateDataRoomDialogOpen}
      renameDataRoomDialogOpen={dialogs.isRenameDataRoomDialogOpen}
      deleteDataRoomDialogOpen={dialogs.isDeleteDataRoomDialogOpen}
      createFolderDialogOpen={dialogs.isCreateFolderDialogOpen}
      renameFolderDialogOpen={dialogs.isRenameFolderDialogOpen}
      deleteFolderDialogOpen={dialogs.isDeleteFolderDialogOpen}
      renameFileDialogOpen={dialogs.isRenameFileDialogOpen}
      deleteFileDialogOpen={dialogs.isDeleteFileDialogOpen}
      viewFileDialogOpen={dialogs.isViewFileDialogOpen}
      dataRoomNameDraft={forms.dataRoomNameDraft}
      dataRoomNameError={forms.dataRoomNameError}
      folderNameDraft={forms.folderNameDraft}
      folderNameError={forms.folderNameError}
      fileNameDraft={forms.fileNameDraft}
      fileNameError={forms.fileNameError}
      activeDataRoomName={activeDataRoomName}
      activeFolderName={activeFolderName}
      targetFolderName={targetFolder ? resolveDisplayName(targetFolder.name) : null}
      activeFileName={activeFile?.name ?? null}
      activeFileId={activeFile?.id ?? null}
      dataRoomDeleteSummary={dataRoomDeleteSummary}
      folderDeleteSummary={folderDeleteSummary}
      onCloseCreateDataRoomDialog={handlers.closeCreateDataRoomDialog}
      onDataRoomNameChange={handlers.handleDataRoomNameDraftChange}
      onCreateDataRoom={handlers.handleCreateDataRoom}
      onCloseRenameDataRoomDialog={handlers.closeRenameDataRoomDialog}
      onRenameDataRoom={handlers.handleRenameDataRoom}
      onCloseDeleteDataRoomDialog={handlers.closeDeleteDataRoomDialog}
      onDeleteDataRoom={handlers.handleDeleteDataRoom}
      onCloseCreateFolderDialog={handlers.closeCreateFolderDialog}
      onFolderNameChange={handlers.handleFolderNameDraftChange}
      onCreateFolder={handlers.handleCreateFolder}
      onCloseRenameFolderDialog={handlers.closeRenameFolderDialog}
      onRenameFolder={handlers.handleRenameFolder}
      onCloseDeleteFolderDialog={handlers.closeDeleteFolderDialog}
      onDeleteFolder={handlers.handleDeleteFolder}
      onCloseRenameFileDialog={handlers.closeRenameFileDialog}
      onFileNameChange={handlers.handleFileNameDraftChange}
      onRenameFile={handlers.handleRenameFile}
      onCloseDeleteFileDialog={handlers.closeDeleteFileDialog}
      onDeleteFile={handlers.handleDeleteFile}
      onCloseViewFileDialog={handlers.closeViewFileDialog}
    />
  )
}
