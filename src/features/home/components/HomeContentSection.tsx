import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { ChangeEvent, RefObject } from 'react'
import type { Folder, NodeId } from '../../dataroom/model'
import type { FileItem, FolderContentItem, SortState } from '../types'
import {
  type ListPaginationHandlers,
  type ListPaginationState,
} from './content/ListPaginationControls'
import { ContentSectionHeader } from './content/ContentSectionHeader'
import { ContentSectionOverlays } from './content/ContentSectionOverlays'
import { ContentSectionTableArea } from './content/ContentSectionTableArea'

export interface HomeContentSectionState {
  activeDataRoomName: string
  activeFolderId: NodeId
  breadcrumbs: Folder[]
  visibleContentItems: FolderContentItem[]
  sortState: SortState
  locale: string
  resolveDisplayName: (value: string) => string
  checkedContentItemIds: NodeId[]
  selectedContentItemCount: number
  deleteSelectedContentItemCount: number
  deleteSelectedFileCount: number
  deleteSelectedFolderCount: number
  selectedContentItemNames: string[]
  indeterminateFolderIds: NodeId[]
  moveContentDialogOpen: boolean
  moveItemCount: number
  moveItemNames: string[]
  moveDestinationFolderId: NodeId | null
  moveDestinationFolderOptions: Array<{ id: NodeId; name: string; depth: number; path: string; parentPath: string | null }>
  moveValidationError: string | null
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  highlightedContentItemId: NodeId | null
  pagination: ListPaginationState
  deleteSelectedContentDialogOpen: boolean
  uploadInputRef: RefObject<HTMLInputElement | null>
}

export interface HomeContentSectionHandlers {
  onCreateFolder: () => void
  onUploadPdf: () => void
  onUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggleSort: (field: 'name' | 'type' | 'updated') => void
  onToggleContentItemSelection: (itemId: NodeId) => void
  onToggleAllContentItemSelection: () => void
  onClearContentItemSelection: () => void
  onOpenDeleteSelectedContentDialog: () => void
  onCloseDeleteSelectedContentDialog: () => void
  onDeleteSelectedContent: () => Promise<void>
  onOpenMoveSelectedContentDialog: () => void
  onCloseMoveContentDialog: () => void
  onMoveDestinationFolderChange: (folderId: NodeId) => void
  onMoveSelectedContent: () => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId) => void
  pagination: ListPaginationHandlers
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileItem['file']) => void
  onOpenRenameFile: (file: FileItem['file']) => void
  onOpenDeleteFile: (file: FileItem['file']) => void
  onOpenMoveFile: (file: FileItem['file']) => void
}

interface HomeContentSectionProps {
  state: HomeContentSectionState
  handlers: HomeContentSectionHandlers
}

export function HomeContentSection({
  state,
  handlers,
}: HomeContentSectionProps) {
  const {
    activeDataRoomName,
    activeFolderId,
    breadcrumbs,
    visibleContentItems,
    sortState,
    locale,
    resolveDisplayName,
    checkedContentItemIds,
    selectedContentItemCount,
    deleteSelectedContentItemCount,
    deleteSelectedFileCount,
    deleteSelectedFolderCount,
    selectedContentItemNames,
    indeterminateFolderIds,
    moveContentDialogOpen,
    moveItemCount,
    moveItemNames,
    moveDestinationFolderId,
    moveDestinationFolderOptions,
    moveValidationError,
    dragMoveActive,
    dragMoveTargetFolderId,
    highlightedContentItemId,
    pagination,
    deleteSelectedContentDialogOpen,
    uploadInputRef,
  } = state

  const {
    onCreateFolder,
    onUploadPdf,
    onUploadInputChange,
    onToggleSort,
    onToggleContentItemSelection,
    onToggleAllContentItemSelection,
    onClearContentItemSelection,
    onOpenDeleteSelectedContentDialog,
    onCloseDeleteSelectedContentDialog,
    onDeleteSelectedContent,
    onOpenMoveSelectedContentDialog,
    onCloseMoveContentDialog,
    onMoveDestinationFolderChange,
    onMoveSelectedContent,
    onStartDragMove,
    onEndDragMove,
    onSetDragMoveTargetFolder,
    onCanDropOnFolder,
    onDropOnFolder,
    pagination: paginationHandlers,
    onSelectFolder,
    onOpenRenameFolder,
    onOpenDeleteFolder,
    onOpenMoveFolder,
    onOpenViewFile,
    onOpenRenameFile,
    onOpenDeleteFile,
    onOpenMoveFile,
  } = handlers

  return (
    <Box component="section" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <ContentSectionHeader
          activeDataRoomName={activeDataRoomName}
          activeFolderId={activeFolderId}
          breadcrumbs={breadcrumbs}
          resolveDisplayName={resolveDisplayName}
          selectedContentItemCount={selectedContentItemCount}
          uploadInputRef={uploadInputRef}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onUploadPdf={onUploadPdf}
          onUploadInputChange={onUploadInputChange}
          onOpenMoveSelectedContentDialog={onOpenMoveSelectedContentDialog}
          onOpenDeleteSelectedContentDialog={onOpenDeleteSelectedContentDialog}
          onClearContentItemSelection={onClearContentItemSelection}
        />

        <ContentSectionTableArea
          visibleContentItems={visibleContentItems}
          sortState={sortState}
          locale={locale}
          resolveDisplayName={resolveDisplayName}
          checkedContentItemIds={checkedContentItemIds}
          highlightedContentItemId={highlightedContentItemId}
          indeterminateFolderIds={indeterminateFolderIds}
          dragMoveActive={dragMoveActive}
          dragMoveTargetFolderId={dragMoveTargetFolderId}
          pagination={pagination}
          paginationHandlers={paginationHandlers}
          onToggleSort={onToggleSort}
          onStartDragMove={onStartDragMove}
          onEndDragMove={onEndDragMove}
          onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
          onCanDropOnFolder={onCanDropOnFolder}
          onDropOnFolder={onDropOnFolder}
          onToggleContentItemSelection={onToggleContentItemSelection}
          onToggleAllContentItemSelection={onToggleAllContentItemSelection}
          onSelectFolder={onSelectFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          onOpenMoveFolder={onOpenMoveFolder}
          onOpenViewFile={onOpenViewFile}
          onOpenRenameFile={onOpenRenameFile}
          onOpenDeleteFile={onOpenDeleteFile}
          onOpenMoveFile={onOpenMoveFile}
        />
      </Stack>

      <ContentSectionOverlays
        moveContentDialogOpen={moveContentDialogOpen}
        moveItemCount={moveItemCount}
        moveItemNames={moveItemNames}
        moveDestinationFolderId={moveDestinationFolderId}
        moveDestinationFolderOptions={moveDestinationFolderOptions}
        moveValidationError={moveValidationError}
        deleteSelectedContentDialogOpen={deleteSelectedContentDialogOpen}
        deleteSelectedContentItemCount={deleteSelectedContentItemCount}
        deleteSelectedFileCount={deleteSelectedFileCount}
        deleteSelectedFolderCount={deleteSelectedFolderCount}
        selectedContentItemNames={selectedContentItemNames}
        onCloseMoveContentDialog={onCloseMoveContentDialog}
        onMoveDestinationFolderChange={onMoveDestinationFolderChange}
        onMoveSelectedContent={onMoveSelectedContent}
        onCloseDeleteSelectedContentDialog={onCloseDeleteSelectedContentDialog}
        onDeleteSelectedContent={onDeleteSelectedContent}
      />
    </Box>
  )
}
