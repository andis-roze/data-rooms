import type { Dispatch, SetStateAction } from 'react'
import type { DataRoom, DataRoomState, FileNode, Folder, NodeId } from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import type { SortState } from '../model/homeViewTypes'

export interface HomeActionCommonParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeDataRoom: DataRoom | undefined
  activeFolder: Folder | null
  targetFolder: Folder | null
  activeFile: FileNode | null
  dataRoomNameDraft: string
  folderNameDraft: string
  fileNameDraft: string
  sortState: SortState
  resolveDisplayName: (value: string) => string
  hasDuplicateDataRoomDisplayName: (candidateName: string, excludeDataRoomId?: NodeId) => boolean
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setSortState: Dispatch<SetStateAction<SortState>>
  setCreateDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setCreateDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setViewFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setTargetFolderId: Dispatch<SetStateAction<NodeId | null>>
  setActiveFileId: Dispatch<SetStateAction<NodeId | null>>
  setFolderNameDraft: Dispatch<SetStateAction<string>>
  setFolderNameError: Dispatch<SetStateAction<string | null>>
  setDataRoomNameDraft: Dispatch<SetStateAction<string>>
  setDataRoomNameError: Dispatch<SetStateAction<string | null>>
  setFileNameDraft: Dispatch<SetStateAction<string>>
  setFileNameError: Dispatch<SetStateAction<string | null>>
}
