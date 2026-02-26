import type { DragEvent } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode, Folder, NodeId } from '../dataroom/model'
import { FolderContentTableHeader } from './components/content/FolderContentTableHeader'
import { FileRow } from './components/FileRow'
import { FolderRow } from './components/FolderRow'
import type { FolderContentItem, SortField, SortState } from './types'

interface FolderContentTableProps {
  items: FolderContentItem[]
  sortState: SortState
  onToggleSort: (field: SortField) => void
  locale: string
  resolveDisplayName: (value: string) => string
  selectedItemIds: NodeId[]
  highlightedItemId: NodeId | null
  indeterminateFolderIds: NodeId[]
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId) => void
  onToggleItemSelection: (itemId: NodeId) => void
  onToggleAllItemSelection: () => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileNode) => void
  onOpenRenameFile: (file: FileNode) => void
  onOpenDeleteFile: (file: FileNode) => void
  onOpenMoveFile: (file: FileNode) => void
}

const rowGridTemplate = {
  xs: '36px minmax(0,1fr) auto',
  md: '40px 120px 1fr 130px 104px',
}

const TYPE_COLUMN_WIDTH = 72
const UPDATED_COLUMN_WIDTH = 112
const ACTIONS_COLUMN_WIDTH = 128

const desktopGridTemplate = `40px ${TYPE_COLUMN_WIDTH}px minmax(180px, 1fr) ${UPDATED_COLUMN_WIDTH}px ${ACTIONS_COLUMN_WIDTH}px`

export function FolderContentTable({
  items,
  sortState,
  onToggleSort,
  locale,
  resolveDisplayName,
  selectedItemIds,
  highlightedItemId,
  indeterminateFolderIds,
  dragMoveActive,
  dragMoveTargetFolderId,
  onStartDragMove,
  onEndDragMove,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  onToggleItemSelection,
  onToggleAllItemSelection,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenMoveFolder,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
  onOpenMoveFile,
}: FolderContentTableProps) {
  const { t } = useTranslation()
  const selectableItems = items.filter((item) => !(item.kind === 'folder' && item.isParentNavigation))
  const selectableItemIds = selectableItems.map((item) => item.id)
  const selectedItemIdSet = new Set(selectedItemIds)
  const selectedSelectableCount = selectableItemIds.filter((itemId) => selectedItemIdSet.has(itemId)).length
  const areAllSelectableItemsSelected = selectableItemIds.length > 0 && selectedSelectableCount === selectableItemIds.length
  const isSelectAllIndeterminate = selectedSelectableCount > 0 && !areAllSelectableItemsSelected
  const handleFolderDragOver = (event: DragEvent<HTMLLIElement>, folderId: NodeId) => {
    if (onCanDropOnFolder(folderId)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1 }}>
      <FolderContentTableHeader
        sortState={sortState}
        onToggleSort={onToggleSort}
        rowGridTemplateXs={rowGridTemplate.xs}
        rowGridTemplateDesktop={desktopGridTemplate}
        areAllSelectableItemsSelected={areAllSelectableItemsSelected}
        isSelectAllIndeterminate={isSelectAllIndeterminate}
        hasSelectableItems={selectableItemIds.length > 0}
        onToggleAllItemSelection={onToggleAllItemSelection}
      />
      <List aria-label={t('dataroomCurrentFolderContentsLabel')}>
        {items.map((item) => {
          if (item.kind === 'folder') {
            return (
              <FolderRow
                key={item.id}
                itemId={item.id}
                folder={item.folder}
                displayName={item.displayName}
                isParentNavigation={item.isParentNavigation}
                rowGridTemplate={desktopGridTemplate}
                locale={locale}
                resolveDisplayName={resolveDisplayName}
                selected={selectedItemIdSet.has(item.id)}
                isHighlighted={highlightedItemId === item.id}
                indeterminate={indeterminateFolderIds.includes(item.id)}
                dragMoveActive={dragMoveActive}
                dragMoveTargeted={dragMoveTargetFolderId === item.id}
                canDrop={onCanDropOnFolder(item.id)}
                onDragMoveStart={onStartDragMove}
                onDragMoveEnd={onEndDragMove}
                onDragMoveEnterFolder={onSetDragMoveTargetFolder}
                onDragMoveLeaveFolder={() => {
                  if (dragMoveTargetFolderId === item.id) {
                    onSetDragMoveTargetFolder(null)
                  }
                }}
                onDragMoveOver={(event) => handleFolderDragOver(event, item.id)}
                onDropOnFolder={(folderId) => onDropOnFolder(folderId)}
                onToggleSelect={onToggleItemSelection}
                onSelectFolder={onSelectFolder}
                onOpenRenameFolder={onOpenRenameFolder}
                onOpenDeleteFolder={onOpenDeleteFolder}
                onOpenMoveFolder={onOpenMoveFolder}
              />
            )
          }

          return (
            <FileRow
              key={item.id}
              itemId={item.id}
              file={item.file}
              rowGridTemplate={desktopGridTemplate}
              locale={locale}
              selected={selectedItemIdSet.has(item.id)}
              isHighlighted={highlightedItemId === item.id}
              dragMoveActive={dragMoveActive}
              onDragMoveStart={onStartDragMove}
              onDragMoveEnd={onEndDragMove}
              onToggleSelect={onToggleItemSelection}
              onOpenViewFile={onOpenViewFile}
              onOpenRenameFile={onOpenRenameFile}
              onOpenDeleteFile={onOpenDeleteFile}
              onOpenMoveFile={onOpenMoveFile}
            />
          )
        })}

        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 4 }} role="status" aria-live="polite">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('dataroomEmptyFolderTitle')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t('dataroomEmptyFolderBody')}
            </Typography>
          </Box>
        ) : null}
      </List>
    </Paper>
  )
}
