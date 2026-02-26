import type { ChangeEvent, RefObject } from 'react'
import type { TFunction } from 'i18next'
import type { DataRoom, DataRoomState, FileNode, Folder, NodeId } from '../../dataroom/model'
import type { FeedbackState, FolderContentItem, SortState } from './homeViewTypes'

export interface HomeDeleteSummary {
  folderCount: number
  fileCount: number
}

export interface HomeDialogState {
  isCreateDataRoomDialogOpen: boolean
  isRenameDataRoomDialogOpen: boolean
  isDeleteDataRoomDialogOpen: boolean
  isCreateFolderDialogOpen: boolean
  isRenameFolderDialogOpen: boolean
  isDeleteFolderDialogOpen: boolean
  isRenameFileDialogOpen: boolean
  isDeleteFileDialogOpen: boolean
  isViewFileDialogOpen: boolean
  isDeleteSelectedContentDialogOpen: boolean
  isMoveContentDialogOpen: boolean
}

export interface HomeFormState {
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  folderNameDraft: string
  folderNameError: string | null
  fileNameDraft: string
  fileNameError: string | null
}

export interface HomePageSelectionState {
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  dataRooms: DataRoom[]
  activeDataRoom: DataRoom | undefined
  rootFolder: Folder | null
  activeFolder: Folder | null
  breadcrumbs: Folder[]
  visibleContentItems: FolderContentItem[]
  locale: string
  targetFolder: Folder | null
  activeFile: FileNode | null
  canDeleteActiveDataRoom: boolean
  dataRoomDeleteSummary: HomeDeleteSummary
  folderDeleteSummary: HomeDeleteSummary
  selectedContentItemIds: NodeId[]
  checkedContentItemIds: NodeId[]
  selectedContentItemCount: number
  selectedFileCount: number
  selectedFolderCount: number
  deleteSelectedContentItemCount: number
  deleteSelectedFileCount: number
  deleteSelectedFolderCount: number
  selectedContentItemNames: string[]
  indeterminateFolderIds: NodeId[]
  moveItemCount: number
  moveItemNames: string[]
  moveDestinationFolderId: NodeId | null
  moveDestinationFolderOptions: Array<{ id: NodeId; name: string; depth: number; path: string; parentPath: string | null }>
  moveValidationError: string | null
  dragMoveActive: boolean
  dragMoveItemIds: NodeId[]
  dragMoveTargetFolderId: NodeId | null
  highlightedContentItemId: NodeId | null
}

export interface HomePageUiState {
  uploadInputRef: RefObject<HTMLInputElement | null>
  sortState: SortState
  feedbackTimeoutMs: number
  feedbackQueue: FeedbackState[]
  dialogs: HomeDialogState
  forms: HomeFormState
}

export interface HomePageHandlers {
  openCreateDataRoomDialog: () => void
  openRenameDataRoomDialog: (dataRoom?: DataRoom) => void
  openDeleteDataRoomDialog: (dataRoom?: DataRoom) => void
  closeCreateDataRoomDialog: () => void
  closeRenameDataRoomDialog: () => void
  closeDeleteDataRoomDialog: () => void
  handleDataRoomNameDraftChange: (value: string) => void
  handleCreateDataRoom: () => void
  handleRenameDataRoom: () => void
  handleDeleteDataRoom: () => Promise<void>
  handleFolderNameDraftChange: (value: string) => void
  openCreateFolderDialog: () => void
  closeCreateFolderDialog: () => void
  openRenameFolderDialog: (folder: Folder) => void
  closeRenameFolderDialog: () => void
  openDeleteFolderDialog: (folder: Folder) => void
  closeDeleteFolderDialog: () => void
  handleCreateFolder: () => void
  handleRenameFolder: () => void
  handleDeleteFolder: () => Promise<void>
  handleFileNameDraftChange: (value: string) => void
  openRenameFileDialog: (file: FileNode) => void
  closeRenameFileDialog: () => void
  openDeleteFileDialog: (file: FileNode) => void
  closeDeleteFileDialog: () => void
  openViewFileDialog: (file: FileNode) => void
  closeViewFileDialog: () => void
  handleUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  handleRenameFile: () => void
  handleDeleteFile: () => Promise<void>
  toggleContentItemSelection: (itemId: NodeId) => void
  toggleAllContentItemSelection: () => void
  clearContentItemSelection: () => void
  openDeleteSelectedContentDialog: () => void
  closeDeleteSelectedContentDialog: () => void
  handleDeleteSelectedContent: () => Promise<void>
  openMoveSelectedContentDialog: () => void
  openMoveFolderDialog: (folder: Folder) => void
  openMoveFileDialog: (file: FileNode) => void
  closeMoveContentDialog: () => void
  handleMoveDestinationFolderChange: (folderId: NodeId) => void
  handleMoveSelectedContent: () => void
  startDragMove: (itemId: NodeId) => void
  endDragMove: () => void
  setDragMoveTargetFolder: (folderId: NodeId | null) => void
  canDropOnFolder: (folderId: NodeId) => boolean
  dropOnFolder: (folderId: NodeId) => void
  moveItemsToFolder: (itemIds: NodeId[], folderId: NodeId) => void
  toggleSort: (field: 'name' | 'type' | 'updated') => void
  dismissFeedback: (id: number) => void
  selectDataRoom: (dataRoomId: NodeId) => void
  selectFolder: (folderId: NodeId) => void
}

export interface HomePageViewModel {
  t: TFunction<'common'>
  entities: DataRoomState
  selection: HomePageSelectionState
  viewHelpers: {
    resolveDisplayName: (value: string) => string
  }
  uiState: HomePageUiState
  handlers: HomePageHandlers
}
