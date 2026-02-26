import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, RefObject } from 'react'
import type { Folder, NodeId } from '../../dataroom/model'
import { FolderContentTable } from '../FolderContentTable'
import type { FileItem, FolderContentItem, SortState } from '../types'
import { ContentActionBar } from './content/ContentActionBar'
import { ContentBreadcrumbBar } from './content/ContentBreadcrumbBar'
import { ContentSelectionBanner } from './content/ContentSelectionBanner'
import { DeleteSelectedContentDialog } from './content/DeleteSelectedContentDialog'
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
  listViewPage: number
  listViewPageCount: number
  listViewItemsPerPage: number
  listViewItemsPerPageOptions: number[]
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
  onListViewPageChange: (page: number) => void
  onListViewItemsPerPageChange: (itemsPerPage: number) => void
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

interface ListPaginationControlsProps {
  listViewPage: number
  listViewPageCount: number
  listViewItemsPerPage: number
  listViewItemsPerPageOptions: number[]
  onListViewPageChange: (page: number) => void
  onListViewItemsPerPageChange: (itemsPerPage: number) => void
}

function ListPaginationControls({
  listViewPage,
  listViewPageCount,
  listViewItemsPerPage,
  listViewItemsPerPageOptions,
  onListViewPageChange,
  onListViewItemsPerPageChange,
}: ListPaginationControlsProps) {
  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    onListViewItemsPerPageChange(Number(event.target.value))
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Items per page
        </Typography>
        <Select
          size="small"
          value={listViewItemsPerPage}
          onChange={handleItemsPerPageChange}
          inputProps={{ 'aria-label': 'Items per page' }}
        >
          {listViewItemsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Page {listViewPage + 1} / {listViewPageCount}
        </Typography>
        <Button
          size="small"
          onClick={() => onListViewPageChange(Math.max(0, listViewPage - 1))}
          disabled={listViewPage <= 0}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <Button
          size="small"
          onClick={() => onListViewPageChange(Math.min(listViewPageCount - 1, listViewPage + 1))}
          disabled={listViewPage >= listViewPageCount - 1}
          aria-label="Next page"
        >
          Next
        </Button>
      </Box>
    </Box>
  )
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
    listViewPage,
    listViewPageCount,
    listViewItemsPerPage,
    listViewItemsPerPageOptions,
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
    onListViewPageChange,
    onListViewItemsPerPageChange,
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

        <ListPaginationControls
          listViewPage={listViewPage}
          listViewPageCount={listViewPageCount}
          listViewItemsPerPage={listViewItemsPerPage}
          listViewItemsPerPageOptions={listViewItemsPerPageOptions}
          onListViewPageChange={onListViewPageChange}
          onListViewItemsPerPageChange={onListViewItemsPerPageChange}
        />

        <FolderContentTable
          items={visibleContentItems}
          sortState={sortState}
          onToggleSort={onToggleSort}
          locale={locale}
          resolveDisplayName={resolveDisplayName}
          selectedItemIds={checkedContentItemIds}
          highlightedItemId={highlightedContentItemId}
          indeterminateFolderIds={indeterminateFolderIds}
          dragMoveActive={dragMoveActive}
          dragMoveTargetFolderId={dragMoveTargetFolderId}
          onStartDragMove={onStartDragMove}
          onEndDragMove={onEndDragMove}
          onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
          onCanDropOnFolder={onCanDropOnFolder}
          onDropOnFolder={onDropOnFolder}
          onToggleItemSelection={onToggleContentItemSelection}
          onToggleAllItemSelection={onToggleAllContentItemSelection}
          onSelectFolder={onSelectFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          onOpenMoveFolder={onOpenMoveFolder}
          onOpenViewFile={onOpenViewFile}
          onOpenRenameFile={onOpenRenameFile}
          onOpenDeleteFile={onOpenDeleteFile}
          onOpenMoveFile={onOpenMoveFile}
        />

        <ListPaginationControls
          listViewPage={listViewPage}
          listViewPageCount={listViewPageCount}
          listViewItemsPerPage={listViewItemsPerPage}
          listViewItemsPerPageOptions={listViewItemsPerPageOptions}
          onListViewPageChange={onListViewPageChange}
          onListViewItemsPerPageChange={onListViewItemsPerPageChange}
        />
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
