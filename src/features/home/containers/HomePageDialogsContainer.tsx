import type {
  HomeDeleteSummary,
  HomeDialogState,
  HomeFormState,
  HomePageHandlers,
  HomePageSelectionState,
} from '../model/homePageViewModel'
import { HomeDialogs } from '../HomeDialogs'

// Maps controller state/handlers into the flattened HomeDialogs props.
interface HomePageDialogsContainerProps {
  dialogs: HomeDialogState
  forms: HomeFormState
  activeDataRoomName: string
  activeFolderName: string
  targetFolder: HomePageSelectionState['targetFolder']
  activeFile: HomePageSelectionState['activeFile']
  dataRoomDeleteSummary: HomeDeleteSummary
  folderDeleteSummary: HomeDeleteSummary
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
      dialogs={dialogs}
      forms={forms}
      activeDataRoomName={activeDataRoomName}
      activeFolderName={activeFolderName}
      targetFolderName={targetFolder ? resolveDisplayName(targetFolder.name) : null}
      activeFileName={activeFile?.name ?? null}
      activeFileId={activeFile?.id ?? null}
      dataRoomDeleteSummary={dataRoomDeleteSummary}
      folderDeleteSummary={folderDeleteSummary}
      handlers={handlers}
    />
  )
}
