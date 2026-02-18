import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode, Folder, NodeId } from '../dataroom/model'
import { FileRow } from './components/FileRow'
import { FolderRow } from './components/FolderRow'
import type { FolderContentItem, SortField, SortState } from './types'

interface FolderContentTableProps {
  items: FolderContentItem[]
  sortState: SortState
  onToggleSort: (field: SortField) => void
  locale: string
  resolveDisplayName: (value: string) => string
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileNode) => void
  onOpenRenameFile: (file: FileNode) => void
  onOpenDeleteFile: (file: FileNode) => void
}

const rowGridTemplate = {
  xs: 'minmax(0,1fr) auto',
  md: 'minmax(0,1fr) 120px 130px 190px',
}

export function FolderContentTable({
  items,
  sortState,
  onToggleSort,
  locale,
  resolveDisplayName,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
}: FolderContentTableProps) {
  const { t } = useTranslation()
  const sortIndicator = (field: SortField) =>
    sortState.field === field ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: rowGridTemplate,
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
          onClick={() => onToggleSort('name')}
          aria-label={t('dataroomSortByNameAria')}
        >
          {t('dataroomColumnName')} {sortIndicator('name')}
        </Button>
        <Button
          size="small"
          color="inherit"
          sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
          onClick={() => onToggleSort('type')}
          aria-label={t('dataroomSortByTypeAria')}
        >
          {t('dataroomColumnType')} {sortIndicator('type')}
        </Button>
        <Button
          size="small"
          color="inherit"
          sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
          onClick={() => onToggleSort('updated')}
          aria-label={t('dataroomSortByUpdatedAria')}
        >
          {t('dataroomColumnUpdated')} {sortIndicator('updated')}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end' }}>
          {t('dataroomColumnActions')}
        </Typography>
      </Box>
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
                locale={locale}
                resolveDisplayName={resolveDisplayName}
                onSelectFolder={onSelectFolder}
                onOpenRenameFolder={onOpenRenameFolder}
                onOpenDeleteFolder={onOpenDeleteFolder}
              />
            )
          }

          return (
            <FileRow
              key={item.id}
              itemId={item.id}
              file={item.file}
              locale={locale}
              onOpenViewFile={onOpenViewFile}
              onOpenRenameFile={onOpenRenameFile}
              onOpenDeleteFile={onOpenDeleteFile}
            />
          )
        })}

        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 4 }}>
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
