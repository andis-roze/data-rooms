import type {
  HomePageHandlers,
  HomePageSelectionState,
  HomePageUiState,
} from '../model/homePageViewModel'
import { HomeDialogs } from '../HomeDialogs'

// Maps controller state/handlers into the flattened HomeDialogs props.
interface HomePageDialogsContainerProps {
  dialogs: HomePageUiState['dialogs']
  forms: HomePageUiState['forms']
  activeDataRoomName: string
  activeFolderName: string
  targetFolder: HomePageSelectionState['targetFolder']
  activeFile: HomePageSelectionState['activeFile']
  dataRoomDeleteSummary: HomePageSelectionState['dataRoomDeleteSummary']
  folderDeleteSummary: HomePageSelectionState['folderDeleteSummary']
  resolveDisplayName: (value: string) => string
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
