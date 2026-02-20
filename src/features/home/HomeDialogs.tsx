import type { NodeId } from '../dataroom/model'
import type {
  HomeDeleteSummary,
  HomeDialogState,
  HomeFormState,
  HomePageHandlers,
} from './model/homePageViewModel'
import { DataRoomDialogs } from './dialogs/DataRoomDialogs'
import { FileDialogs } from './dialogs/FileDialogs'
import { FilePreviewDialog } from './dialogs/FilePreviewDialog'
import { FolderDialogs } from './dialogs/FolderDialogs'
export { CreateDataRoomDialog } from './dialogs/CreateDataRoomDialog'
export { FeedbackStack } from './dialogs/FeedbackStack'

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
  handlers: Pick<
    HomePageHandlers,
    | 'closeCreateDataRoomDialog'
    | 'handleDataRoomNameDraftChange'
    | 'handleCreateDataRoom'
    | 'closeRenameDataRoomDialog'
    | 'handleRenameDataRoom'
    | 'closeDeleteDataRoomDialog'
    | 'handleDeleteDataRoom'
    | 'closeCreateFolderDialog'
    | 'handleFolderNameDraftChange'
    | 'handleCreateFolder'
    | 'closeRenameFolderDialog'
    | 'handleRenameFolder'
    | 'closeDeleteFolderDialog'
    | 'handleDeleteFolder'
    | 'closeRenameFileDialog'
    | 'handleFileNameDraftChange'
    | 'handleRenameFile'
    | 'closeDeleteFileDialog'
    | 'handleDeleteFile'
    | 'closeViewFileDialog'
  >
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
  handlers,
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
        onCloseCreateDataRoomDialog={handlers.closeCreateDataRoomDialog}
        onDataRoomNameChange={handlers.handleDataRoomNameDraftChange}
        onCreateDataRoom={handlers.handleCreateDataRoom}
        onCloseRenameDataRoomDialog={handlers.closeRenameDataRoomDialog}
        onRenameDataRoom={handlers.handleRenameDataRoom}
        onCloseDeleteDataRoomDialog={handlers.closeDeleteDataRoomDialog}
        onDeleteDataRoom={handlers.handleDeleteDataRoom}
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
        onCloseCreateFolderDialog={handlers.closeCreateFolderDialog}
        onFolderNameChange={handlers.handleFolderNameDraftChange}
        onCreateFolder={handlers.handleCreateFolder}
        onCloseRenameFolderDialog={handlers.closeRenameFolderDialog}
        onRenameFolder={handlers.handleRenameFolder}
        onCloseDeleteFolderDialog={handlers.closeDeleteFolderDialog}
        onDeleteFolder={handlers.handleDeleteFolder}
      />

      <FileDialogs
        renameFileDialogOpen={dialogs.isRenameFileDialogOpen}
        deleteFileDialogOpen={dialogs.isDeleteFileDialogOpen}
        fileNameDraft={forms.fileNameDraft}
        fileNameError={forms.fileNameError}
        activeFileName={activeFileName}
        onCloseRenameFileDialog={handlers.closeRenameFileDialog}
        onFileNameChange={handlers.handleFileNameDraftChange}
        onRenameFile={handlers.handleRenameFile}
        onCloseDeleteFileDialog={handlers.closeDeleteFileDialog}
        onDeleteFile={handlers.handleDeleteFile}
      />

      <FilePreviewDialog
        viewFileDialogOpen={dialogs.isViewFileDialogOpen}
        activeFileId={activeFileId}
        activeFileName={activeFileName}
        onCloseViewFileDialog={handlers.closeViewFileDialog}
      />
    </>
  )
}
