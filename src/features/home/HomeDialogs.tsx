import type { NodeId } from '../dataroom/model'
import { DataRoomDialogs } from './dialogs/DataRoomDialogs'
import { FileDialogs } from './dialogs/FileDialogs'
import { FilePreviewDialog } from './dialogs/FilePreviewDialog'
import { FolderDialogs } from './dialogs/FolderDialogs'
export { CreateDataRoomDialog } from './dialogs/CreateDataRoomDialog'
export { FeedbackStack } from './dialogs/FeedbackStack'

// Composes all home-page dialogs behind a single prop surface for container usage.
interface HomeDialogsProps {
  createDataRoomDialogOpen: boolean
  renameDataRoomDialogOpen: boolean
  deleteDataRoomDialogOpen: boolean
  createFolderDialogOpen: boolean
  renameFolderDialogOpen: boolean
  deleteFolderDialogOpen: boolean
  renameFileDialogOpen: boolean
  deleteFileDialogOpen: boolean
  viewFileDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  folderNameDraft: string
  folderNameError: string | null
  fileNameDraft: string
  fileNameError: string | null
  activeDataRoomName: string
  activeFolderName: string
  targetFolderName: string | null
  activeFileId: NodeId | null
  activeFileName: string | null
  dataRoomDeleteSummary: { folderCount: number; fileCount: number }
  folderDeleteSummary: { folderCount: number; fileCount: number }
  onCloseCreateDataRoomDialog: () => void
  onDataRoomNameChange: (value: string) => void
  onCreateDataRoom: () => void
  onCloseRenameDataRoomDialog: () => void
  onRenameDataRoom: () => void
  onCloseDeleteDataRoomDialog: () => void
  onDeleteDataRoom: () => void
  onCloseCreateFolderDialog: () => void
  onFolderNameChange: (value: string) => void
  onCreateFolder: () => void
  onCloseRenameFolderDialog: () => void
  onRenameFolder: () => void
  onCloseDeleteFolderDialog: () => void
  onDeleteFolder: () => void
  onCloseRenameFileDialog: () => void
  onFileNameChange: (value: string) => void
  onRenameFile: () => void
  onCloseDeleteFileDialog: () => void
  onDeleteFile: () => void
  onCloseViewFileDialog: () => void
}

export function HomeDialogs({
  createDataRoomDialogOpen,
  renameDataRoomDialogOpen,
  deleteDataRoomDialogOpen,
  createFolderDialogOpen,
  renameFolderDialogOpen,
  deleteFolderDialogOpen,
  renameFileDialogOpen,
  deleteFileDialogOpen,
  viewFileDialogOpen,
  dataRoomNameDraft,
  dataRoomNameError,
  folderNameDraft,
  folderNameError,
  fileNameDraft,
  fileNameError,
  activeDataRoomName,
  activeFolderName,
  targetFolderName,
  activeFileId,
  activeFileName,
  dataRoomDeleteSummary,
  folderDeleteSummary,
  onCloseCreateDataRoomDialog,
  onDataRoomNameChange,
  onCreateDataRoom,
  onCloseRenameDataRoomDialog,
  onRenameDataRoom,
  onCloseDeleteDataRoomDialog,
  onDeleteDataRoom,
  onCloseCreateFolderDialog,
  onFolderNameChange,
  onCreateFolder,
  onCloseRenameFolderDialog,
  onRenameFolder,
  onCloseDeleteFolderDialog,
  onDeleteFolder,
  onCloseRenameFileDialog,
  onFileNameChange,
  onRenameFile,
  onCloseDeleteFileDialog,
  onDeleteFile,
  onCloseViewFileDialog,
}: HomeDialogsProps) {
  return (
    <>
      <DataRoomDialogs
        createDataRoomDialogOpen={createDataRoomDialogOpen}
        renameDataRoomDialogOpen={renameDataRoomDialogOpen}
        deleteDataRoomDialogOpen={deleteDataRoomDialogOpen}
        dataRoomNameDraft={dataRoomNameDraft}
        dataRoomNameError={dataRoomNameError}
        activeDataRoomName={activeDataRoomName}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        onCloseCreateDataRoomDialog={onCloseCreateDataRoomDialog}
        onDataRoomNameChange={onDataRoomNameChange}
        onCreateDataRoom={onCreateDataRoom}
        onCloseRenameDataRoomDialog={onCloseRenameDataRoomDialog}
        onRenameDataRoom={onRenameDataRoom}
        onCloseDeleteDataRoomDialog={onCloseDeleteDataRoomDialog}
        onDeleteDataRoom={onDeleteDataRoom}
      />

      <FolderDialogs
        createFolderDialogOpen={createFolderDialogOpen}
        renameFolderDialogOpen={renameFolderDialogOpen}
        deleteFolderDialogOpen={deleteFolderDialogOpen}
        folderNameDraft={folderNameDraft}
        folderNameError={folderNameError}
        activeFolderName={activeFolderName}
        targetFolderName={targetFolderName}
        folderDeleteSummary={folderDeleteSummary}
        onCloseCreateFolderDialog={onCloseCreateFolderDialog}
        onFolderNameChange={onFolderNameChange}
        onCreateFolder={onCreateFolder}
        onCloseRenameFolderDialog={onCloseRenameFolderDialog}
        onRenameFolder={onRenameFolder}
        onCloseDeleteFolderDialog={onCloseDeleteFolderDialog}
        onDeleteFolder={onDeleteFolder}
      />

      <FileDialogs
        renameFileDialogOpen={renameFileDialogOpen}
        deleteFileDialogOpen={deleteFileDialogOpen}
        fileNameDraft={fileNameDraft}
        fileNameError={fileNameError}
        activeFileName={activeFileName}
        onCloseRenameFileDialog={onCloseRenameFileDialog}
        onFileNameChange={onFileNameChange}
        onRenameFile={onRenameFile}
        onCloseDeleteFileDialog={onCloseDeleteFileDialog}
        onDeleteFile={onDeleteFile}
      />

      <FilePreviewDialog
        viewFileDialogOpen={viewFileDialogOpen}
        activeFileId={activeFileId}
        activeFileName={activeFileName}
        onCloseViewFileDialog={onCloseViewFileDialog}
      />
    </>
  )
}
