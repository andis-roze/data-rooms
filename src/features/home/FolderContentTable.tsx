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
  md: '120px 1fr 130px 104px',
}

const TYPE_COLUMN_WIDTH = 72
const UPDATED_COLUMN_WIDTH = 112
const ACTIONS_COLUMN_WIDTH = 90

const desktopGridTemplate = `${TYPE_COLUMN_WIDTH}px minmax(180px, 1fr) ${UPDATED_COLUMN_WIDTH}px ${ACTIONS_COLUMN_WIDTH}px`

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
  const headerSeparatorSx = {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 2,
      right: 0,
      bottom: 2,
      width: '1px',
      backgroundColor: 'divider',
    },
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: rowGridTemplate.xs, md: desktopGridTemplate },
          gap: 1,
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: { xs: 'none', md: 'block' },
            minWidth: 0,
            pr: 1,
            ...headerSeparatorSx,
          }}
        >
          <Button
            size="small"
            color="inherit"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              justifyContent: 'flex-start',
              px: 0.5,
              minWidth: 0,
              whiteSpace: 'nowrap',
            }}
            onClick={() => onToggleSort('type')}
            aria-label={t('dataroomSortByTypeAria')}
            aria-pressed={sortState.field === 'type'}
          >
            {t('dataroomColumnType')} {sortIndicator('type')}
          </Button>
        </Box>
        <Box
          sx={{
            position: 'relative',
            minWidth: 0,
            pr: { xs: 0, md: 1 },
            ...headerSeparatorSx,
            '&::after': {
              ...headerSeparatorSx['&::after'],
              display: { xs: 'none', md: 'block' },
            },
          }}
        >
          <Button
            size="small"
            color="inherit"
            sx={{ justifyContent: 'flex-start', px: 0.5, minWidth: 0, whiteSpace: 'nowrap' }}
            onClick={() => onToggleSort('name')}
            aria-label={t('dataroomSortByNameAria')}
            aria-pressed={sortState.field === 'name'}
          >
            {t('dataroomColumnName')} {sortIndicator('name')}
          </Button>
        </Box>
        <Box
          sx={{
            position: 'relative',
            display: { xs: 'none', md: 'block' },
            minWidth: 0,
            pr: 1,
            ...headerSeparatorSx,
          }}
        >
          <Button
            size="small"
            color="inherit"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              justifyContent: 'flex-start',
              px: 0.5,
              minWidth: 0,
              whiteSpace: 'nowrap',
            }}
            onClick={() => onToggleSort('updated')}
            aria-label={t('dataroomSortByUpdatedAria')}
            aria-pressed={sortState.field === 'updated'}
          >
            {t('dataroomColumnUpdated')} {sortIndicator('updated')}
          </Button>
        </Box>
        <Box sx={{ position: 'relative', minWidth: 0, pl: { xs: 0, md: 0.5 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end' }}>
            {t('dataroomColumnActions')}
          </Typography>
        </Box>
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
                rowGridTemplate={desktopGridTemplate}
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
              rowGridTemplate={desktopGridTemplate}
              locale={locale}
              onOpenViewFile={onOpenViewFile}
              onOpenRenameFile={onOpenRenameFile}
              onOpenDeleteFile={onOpenDeleteFile}
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
