import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode, Folder, NodeId } from '../dataroom/model'
import type { FolderContentItem, SortField, SortState } from './types'
import { formatFileSize, formatUpdatedAt } from './utils'

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

const actionGridTemplate = {
  xs: 'repeat(2, max-content)',
  md: 'repeat(2, minmax(84px, 1fr))',
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
          {t('dataroomColumnName')} {sortState.field === 'name' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
        </Button>
        <Button
          size="small"
          color="inherit"
          sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
          onClick={() => onToggleSort('type')}
          aria-label={t('dataroomSortByTypeAria')}
        >
          {t('dataroomColumnType')} {sortState.field === 'type' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
        </Button>
        <Button
          size="small"
          color="inherit"
          sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
          onClick={() => onToggleSort('updated')}
          aria-label={t('dataroomSortByUpdatedAria')}
        >
          {t('dataroomColumnUpdated')} {sortState.field === 'updated' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end' }}>
          {t('dataroomColumnActions')}
        </Typography>
      </Box>
      <List aria-label={t('dataroomCurrentFolderContentsLabel')}>
        {items.map((item) => {
          if (item.kind === 'folder' && item.folder) {
            const folder = item.folder

            return (
              <ListItem key={item.id} disablePadding sx={{ px: 2, py: 1 }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: rowGridTemplate,
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Button
                    size="small"
                    color="inherit"
                    sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
                    aria-label={t('dataroomAriaOpenFolder', { name: resolveDisplayName(folder.name) })}
                    onClick={() => onSelectFolder(folder.id)}
                  >
                    <Typography noWrap>{item.displayName ?? resolveDisplayName(folder.name)}</Typography>
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                    {t('dataroomFolderItemType')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                    {formatUpdatedAt(folder.updatedAt, locale)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: actionGridTemplate,
                      gap: 0.5,
                      justifySelf: 'end',
                      justifyItems: { xs: 'end', md: 'stretch' },
                      width: { xs: 'auto', md: '100%' },
                    }}
                  >
                    {item.isParentNavigation ? (
                      <>
                        <Box />
                        <Box />
                      </>
                    ) : (
                      <>
                        <Button
                          size="small"
                          sx={{ minWidth: 84 }}
                          aria-label={t('dataroomAriaRenameFolder', { name: resolveDisplayName(folder.name) })}
                          onClick={() => onOpenRenameFolder(folder)}
                        >
                          {t('dataroomActionRename')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          sx={{ minWidth: 84 }}
                          aria-label={t('dataroomAriaDeleteFolder', { name: resolveDisplayName(folder.name) })}
                          onClick={() => onOpenDeleteFolder(folder)}
                        >
                          {t('dataroomActionDelete')}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </ListItem>
            )
          }

          if (item.kind === 'file' && item.file) {
            const file = item.file

            return (
              <ListItem key={item.id} disablePadding sx={{ px: 2, py: 1 }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: rowGridTemplate,
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Button
                    size="small"
                    color="inherit"
                    sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
                    aria-label={t('dataroomAriaViewFile', { name: file.name })}
                    onClick={() => onOpenViewFile(file)}
                  >
                    <Typography noWrap>{file.name}</Typography>
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                    {`${t('dataroomFileItemType')} - ${formatFileSize(file.size)}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                    {formatUpdatedAt(file.updatedAt, locale)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: actionGridTemplate,
                      gap: 0.5,
                      justifySelf: 'end',
                      justifyItems: { xs: 'end', md: 'stretch' },
                      width: { xs: 'auto', md: '100%' },
                    }}
                  >
                    <Button
                      size="small"
                      sx={{ minWidth: 84 }}
                      aria-label={t('dataroomAriaRenameFile', { name: file.name })}
                      onClick={() => onOpenRenameFile(file)}
                    >
                      {t('dataroomActionRenameFile')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      sx={{ minWidth: 84 }}
                      aria-label={t('dataroomAriaDeleteFile', { name: file.name })}
                      onClick={() => onOpenDeleteFile(file)}
                    >
                      {t('dataroomActionDeleteFile')}
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            )
          }

          return null
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
