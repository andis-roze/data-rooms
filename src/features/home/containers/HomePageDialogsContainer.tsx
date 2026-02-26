import type {
  HomeDeleteSummary,
  HomeDialogState,
  HomeFormState,
  HomePageHandlerGroups,
  HomePageSelectionState,
} from '../model/homePageViewModel'
import { HomeDialogs } from '../HomeDialogs'

// Maps controller state/handlers into grouped HomeDialogs handler props.
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
  handlers: Pick<HomePageHandlerGroups, 'dataRoom' | 'folder' | 'file'>
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
      dataRoomHandlers={handlers.dataRoom}
      folderHandlers={handlers.folder}
      fileHandlers={handlers.file}
      previewHandlers={handlers.file}
    />
  )
}
