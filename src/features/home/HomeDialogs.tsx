import type { NodeId } from '../dataroom/model'
import type {
  HomeDeleteSummary,
  HomeDialogState,
  HomeDataRoomHandlers,
  HomeFileHandlers,
  HomeFolderHandlers,
  HomeFormState,
} from './model/homePageViewModel'
import { DataRoomDialogs } from './dialogs/DataRoomDialogs'
import { FileDialogs } from './dialogs/FileDialogs'
import { FilePreviewDialog } from './dialogs/FilePreviewDialog'
import { FolderDialogs } from './dialogs/FolderDialogs'

type DataRoomDialogHandlers = HomeDataRoomHandlers
type FolderDialogHandlers = HomeFolderHandlers
type FileDialogHandlers = HomeFileHandlers
type PreviewDialogHandlers = Pick<HomeFileHandlers, 'closeViewFileDialog'>

// Composes all home-page dialogs behind a single prop surface for container usage.
interface HomeDialogsProps {
  dialogs: HomeDialogState
  forms: HomeFormState
  activeDataRoomName: string
  activeFolderName: string
  targetFolderName: string | null
  activeFileId: NodeId | null
  activeFileName: string | null
  dataRoomDeleteSummary: HomeDeleteSummary
  folderDeleteSummary: HomeDeleteSummary
  dataRoomHandlers: DataRoomDialogHandlers
  folderHandlers: FolderDialogHandlers
  fileHandlers: FileDialogHandlers
  previewHandlers: PreviewDialogHandlers
}

export function HomeDialogs({
  dialogs,
  forms,
  activeDataRoomName,
  activeFolderName,
  targetFolderName,
  activeFileId,
  activeFileName,
  dataRoomDeleteSummary,
  folderDeleteSummary,
  dataRoomHandlers,
  folderHandlers,
  fileHandlers,
  previewHandlers,
}: HomeDialogsProps) {
  return (
    <>
      <DataRoomDialogs
        createDataRoomDialogOpen={dialogs.isCreateDataRoomDialogOpen}
        renameDataRoomDialogOpen={dialogs.isRenameDataRoomDialogOpen}
        deleteDataRoomDialogOpen={dialogs.isDeleteDataRoomDialogOpen}
        dataRoomNameDraft={forms.dataRoomNameDraft}
        dataRoomNameError={forms.dataRoomNameError}
        activeDataRoomName={activeDataRoomName}
        dataRoomDeleteSummary={dataRoomDeleteSummary}
        onCloseCreateDataRoomDialog={dataRoomHandlers.closeCreateDataRoomDialog}
        onDataRoomNameChange={dataRoomHandlers.handleDataRoomNameDraftChange}
        onCreateDataRoom={dataRoomHandlers.handleCreateDataRoom}
        onCloseRenameDataRoomDialog={dataRoomHandlers.closeRenameDataRoomDialog}
        onRenameDataRoom={dataRoomHandlers.handleRenameDataRoom}
        onCloseDeleteDataRoomDialog={dataRoomHandlers.closeDeleteDataRoomDialog}
        onDeleteDataRoom={dataRoomHandlers.handleDeleteDataRoom}
      />

      <FolderDialogs
        createFolderDialogOpen={dialogs.isCreateFolderDialogOpen}
        renameFolderDialogOpen={dialogs.isRenameFolderDialogOpen}
        deleteFolderDialogOpen={dialogs.isDeleteFolderDialogOpen}
        folderNameDraft={forms.folderNameDraft}
        folderNameError={forms.folderNameError}
        activeFolderName={activeFolderName}
        targetFolderName={targetFolderName}
        folderDeleteSummary={folderDeleteSummary}
        onCloseCreateFolderDialog={folderHandlers.closeCreateFolderDialog}
        onFolderNameChange={folderHandlers.handleFolderNameDraftChange}
        onCreateFolder={folderHandlers.handleCreateFolder}
        onCloseRenameFolderDialog={folderHandlers.closeRenameFolderDialog}
        onRenameFolder={folderHandlers.handleRenameFolder}
        onCloseDeleteFolderDialog={folderHandlers.closeDeleteFolderDialog}
        onDeleteFolder={folderHandlers.handleDeleteFolder}
      />

      <FileDialogs
        renameFileDialogOpen={dialogs.isRenameFileDialogOpen}
        deleteFileDialogOpen={dialogs.isDeleteFileDialogOpen}
        fileNameDraft={forms.fileNameDraft}
        fileNameError={forms.fileNameError}
        activeFileName={activeFileName}
        onCloseRenameFileDialog={fileHandlers.closeRenameFileDialog}
        onFileNameChange={fileHandlers.handleFileNameDraftChange}
        onRenameFile={fileHandlers.handleRenameFile}
        onCloseDeleteFileDialog={fileHandlers.closeDeleteFileDialog}
        onDeleteFile={fileHandlers.handleDeleteFile}
      />

      <FilePreviewDialog
        viewFileDialogOpen={dialogs.isViewFileDialogOpen}
        activeFileId={activeFileId}
        activeFileName={activeFileName}
        onCloseViewFileDialog={previewHandlers.closeViewFileDialog}
      />
    </>
  )
}
