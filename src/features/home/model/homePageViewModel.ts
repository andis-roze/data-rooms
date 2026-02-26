import type { ChangeEvent, RefObject } from 'react'
import type { TFunction } from 'i18next'
import type { DataRoom, FileNode, Folder, NodeId } from '../../dataroom/model'
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
  checkedContentItemIds: NodeId[]
  selectedContentItemCount: number
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
  dragMoveTargetFolderId: NodeId | null
  highlightedContentItemId: NodeId | null
  listViewPage: number
  listViewPageCount: number
  listViewItemsPerPage: number
  listViewItemsPerPageOptions: number[]
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
  handleListViewPageChange: (page: number) => void
  handleListViewItemsPerPageChange: (itemsPerPage: number) => void
  toggleSort: (field: 'name' | 'type' | 'updated') => void
  dismissFeedback: (id: number) => void
  selectDataRoom: (dataRoomId: NodeId) => void
  selectFolder: (folderId: NodeId) => void
}

export type HomeDataRoomHandlers = Pick<
  HomePageHandlers,
  | 'openCreateDataRoomDialog'
  | 'openRenameDataRoomDialog'
  | 'openDeleteDataRoomDialog'
  | 'closeCreateDataRoomDialog'
  | 'closeRenameDataRoomDialog'
  | 'closeDeleteDataRoomDialog'
  | 'handleDataRoomNameDraftChange'
  | 'handleCreateDataRoom'
  | 'handleRenameDataRoom'
  | 'handleDeleteDataRoom'
>

export type HomeFolderHandlers = Pick<
  HomePageHandlers,
  | 'handleFolderNameDraftChange'
  | 'openCreateFolderDialog'
  | 'closeCreateFolderDialog'
  | 'openRenameFolderDialog'
  | 'closeRenameFolderDialog'
  | 'openDeleteFolderDialog'
  | 'closeDeleteFolderDialog'
  | 'handleCreateFolder'
  | 'handleRenameFolder'
  | 'handleDeleteFolder'
>

export type HomeFileHandlers = Pick<
  HomePageHandlers,
  | 'handleFileNameDraftChange'
  | 'openRenameFileDialog'
  | 'closeRenameFileDialog'
  | 'openDeleteFileDialog'
  | 'closeDeleteFileDialog'
  | 'openViewFileDialog'
  | 'closeViewFileDialog'
  | 'handleUploadInputChange'
  | 'handleRenameFile'
  | 'handleDeleteFile'
>

export type HomeSelectionHandlers = Pick<
  HomePageHandlers,
  | 'toggleContentItemSelection'
  | 'toggleAllContentItemSelection'
  | 'clearContentItemSelection'
  | 'openDeleteSelectedContentDialog'
  | 'closeDeleteSelectedContentDialog'
  | 'handleDeleteSelectedContent'
>

export type HomeMoveHandlers = Pick<
  HomePageHandlers,
  | 'openMoveSelectedContentDialog'
  | 'openMoveFolderDialog'
  | 'openMoveFileDialog'
  | 'closeMoveContentDialog'
  | 'handleMoveDestinationFolderChange'
  | 'handleMoveSelectedContent'
  | 'startDragMove'
  | 'endDragMove'
  | 'setDragMoveTargetFolder'
  | 'canDropOnFolder'
  | 'dropOnFolder'
>

export type HomeListHandlers = Pick<
  HomePageHandlers,
  'handleListViewPageChange' | 'handleListViewItemsPerPageChange' | 'toggleSort'
>

export type HomeNavigationHandlers = Pick<HomePageHandlers, 'selectDataRoom' | 'selectFolder'>
export type HomeFeedbackHandlers = Pick<HomePageHandlers, 'dismissFeedback'>

export interface HomePageHandlerGroups {
  dataRoom: HomeDataRoomHandlers
  folder: HomeFolderHandlers
  file: HomeFileHandlers
  selection: HomeSelectionHandlers
  move: HomeMoveHandlers
  list: HomeListHandlers
  navigation: HomeNavigationHandlers
  feedback: HomeFeedbackHandlers
}

export interface HomePageViewModel {
  t: TFunction<'common'>
  selection: HomePageSelectionState
  viewHelpers: {
    resolveDisplayName: (value: string) => string
  }
  uiState: HomePageUiState
  handlers: HomePageHandlers
  handlerGroups: HomePageHandlerGroups
}
