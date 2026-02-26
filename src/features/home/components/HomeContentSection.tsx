import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { ChangeEvent, RefObject } from 'react'
import type { Folder, NodeId } from '../../dataroom/model'
import { FolderContentTable } from '../FolderContentTable'
import type { FileItem, FolderContentItem, SortState } from '../types'
import { ContentActionBar } from './content/ContentActionBar'
import { ContentBreadcrumbBar } from './content/ContentBreadcrumbBar'
import { ContentSelectionBanner } from './content/ContentSelectionBanner'
import { DeleteSelectedContentDialog } from './content/DeleteSelectedContentDialog'
import { ListPaginationControls } from './content/ListPaginationControls'
import { MoveContentDialog } from './content/MoveContentDialog'

interface HomeContentSectionStateProps {
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
  pagination: {
    page: number
    pageCount: number
    itemsPerPage: number
    itemsPerPageOptions: number[]
  }
  deleteSelectedContentDialogOpen: boolean
  uploadInputRef: RefObject<HTMLInputElement | null>
}

interface HomeContentSectionHandlerProps {
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
  pagination: {
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
  }
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
  state: HomeContentSectionStateProps
  handlers: HomeContentSectionHandlerProps
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
        <ContentBreadcrumbBar
          activeDataRoomName={activeDataRoomName}
          activeFolderId={activeFolderId}
          breadcrumbs={breadcrumbs}
          resolveDisplayName={resolveDisplayName}
          onSelectFolder={onSelectFolder}
        />

        <ContentActionBar onCreateFolder={onCreateFolder} onUploadPdf={onUploadPdf} />

        <input
          ref={uploadInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onUploadInputChange}
          data-testid="upload-pdf-input"
          style={{ display: 'none' }}
        />

        <ContentSelectionBanner
          selectedContentItemCount={selectedContentItemCount}
          onOpenMoveSelectedContentDialog={onOpenMoveSelectedContentDialog}
          onOpenDeleteSelectedContentDialog={onOpenDeleteSelectedContentDialog}
          onClearContentItemSelection={onClearContentItemSelection}
        />

        <ListPaginationControls state={pagination} handlers={paginationHandlers} />

        <FolderContentTable
          state={{
            items: visibleContentItems,
            sortState,
            locale,
            resolveDisplayName,
            selectedItemIds: checkedContentItemIds,
            highlightedItemId: highlightedContentItemId,
            indeterminateFolderIds,
            dragMoveActive,
            dragMoveTargetFolderId,
          }}
          handlers={{
            onToggleSort,
            onStartDragMove,
            onEndDragMove,
            onSetDragMoveTargetFolder,
            onCanDropOnFolder,
            onDropOnFolder,
            onToggleItemSelection: onToggleContentItemSelection,
            onToggleAllItemSelection: onToggleAllContentItemSelection,
            onSelectFolder,
            onOpenRenameFolder,
            onOpenDeleteFolder,
            onOpenMoveFolder,
            onOpenViewFile,
            onOpenRenameFile,
            onOpenDeleteFile,
            onOpenMoveFile,
          }}
        />

        <ListPaginationControls state={pagination} handlers={paginationHandlers} />
      </Stack>

      <MoveContentDialog
        open={moveContentDialogOpen}
        moveItemCount={moveItemCount}
        moveItemNames={moveItemNames}
        moveDestinationFolderId={moveDestinationFolderId}
        moveDestinationFolderOptions={moveDestinationFolderOptions}
        moveValidationError={moveValidationError}
        onClose={onCloseMoveContentDialog}
        onMoveDestinationFolderChange={onMoveDestinationFolderChange}
        onConfirmMove={onMoveSelectedContent}
      />

      <DeleteSelectedContentDialog
        open={deleteSelectedContentDialogOpen}
        deleteSelectedContentItemCount={deleteSelectedContentItemCount}
        deleteSelectedFileCount={deleteSelectedFileCount}
        deleteSelectedFolderCount={deleteSelectedFolderCount}
        selectedContentItemNames={selectedContentItemNames}
        onClose={onCloseDeleteSelectedContentDialog}
        onConfirmDelete={onDeleteSelectedContent}
      />
    </Box>
  )
}
