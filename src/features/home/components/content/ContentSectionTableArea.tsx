import Stack from '@mui/material/Stack'
import type { Folder, NodeId } from '../../../dataroom/model'
import { FolderContentTable } from '../../FolderContentTable'
import type { FileItem, FolderContentItem, SortState } from '../../types'
import {
  ListPaginationControls,
  type ListPaginationHandlers,
  type ListPaginationState,
} from './ListPaginationControls'

interface ContentSectionTableAreaProps {
  visibleContentItems: FolderContentItem[]
  sortState: SortState
  locale: string
  resolveDisplayName: (value: string) => string
  checkedContentItemIds: NodeId[]
  highlightedContentItemId: NodeId | null
  indeterminateFolderIds: NodeId[]
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  pagination: ListPaginationState
  paginationHandlers: ListPaginationHandlers
  onToggleSort: (field: 'name' | 'type' | 'updated') => void
  onUploadDroppedFiles: (files: File[]) => Promise<void>
  onUploadDroppedFilesToFolder: (folderId: NodeId, files: File[]) => Promise<void>
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId) => void
  onToggleContentItemSelection: (itemId: NodeId) => void
  onToggleAllContentItemSelection: () => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileItem['file']) => void
  onOpenRenameFile: (file: FileItem['file']) => void
  onOpenDeleteFile: (file: FileItem['file']) => void
  onOpenMoveFile: (file: FileItem['file']) => void
}

export function ContentSectionTableArea({
  visibleContentItems,
  sortState,
  locale,
  resolveDisplayName,
  checkedContentItemIds,
  highlightedContentItemId,
  indeterminateFolderIds,
  dragMoveActive,
  dragMoveTargetFolderId,
  pagination,
  paginationHandlers,
  onToggleSort,
  onUploadDroppedFiles,
  onUploadDroppedFilesToFolder,
  onStartDragMove,
  onEndDragMove,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  onToggleContentItemSelection,
  onToggleAllContentItemSelection,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenMoveFolder,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
  onOpenMoveFile,
}: ContentSectionTableAreaProps) {
  return (
    <Stack spacing={2.5}>
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
          onUploadDroppedFiles,
          onUploadDroppedFilesToFolder,
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
  )
}
