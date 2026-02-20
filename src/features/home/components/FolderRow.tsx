import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../dataroom/model'
import { formatPathForDisplay, formatUpdatedAt } from '../services/formatters'

interface FolderRowProps {
  itemId: string
  folder: Folder
  displayName?: string
  isParentNavigation?: boolean
  locale: string
  resolveDisplayName: (value: string) => string
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
}

const rowGridTemplate = {
  xs: 'minmax(0,1fr) auto',
  md: '120px minmax(0,1fr) 130px 104px',
}

const actionGridTemplate = {
  xs: 'repeat(2, max-content)',
  md: 'repeat(2, max-content)',
}

export function FolderRow({
  itemId,
  folder,
  displayName,
  isParentNavigation,
  locale,
  resolveDisplayName,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
}: FolderRowProps) {
  const { t } = useTranslation()

  return (
    <ListItem key={itemId} disablePadding sx={{ px: 2, py: 1 }}>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: rowGridTemplate,
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center' }}
          title={t('dataroomFolderItemType')}
          aria-label={t('dataroomFolderItemType')}
        >
          <FolderOutlinedIcon fontSize="small" color="action" />
        </Box>
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
          aria-label={t('dataroomAriaOpenFolder', { name: resolveDisplayName(folder.name) })}
          onClick={() => onSelectFolder(folder.id)}
          title={displayName ?? resolveDisplayName(folder.name)}
        >
          <Typography noWrap>{formatPathForDisplay(displayName ?? resolveDisplayName(folder.name))}</Typography>
        </Button>
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
          {isParentNavigation ? (
            <>
              <Box />
              <Box />
            </>
          ) : (
            <>
              <Tooltip title={t('dataroomActionRename')}>
                <IconButton
                  size="small"
                  aria-label={t('dataroomAriaRenameFolder', { name: resolveDisplayName(folder.name) })}
                  onClick={() => onOpenRenameFolder(folder)}
                >
                  <DriveFileRenameOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('dataroomActionDelete')}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={t('dataroomAriaDeleteFolder', { name: resolveDisplayName(folder.name) })}
                  onClick={() => onOpenDeleteFolder(folder)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </ListItem>
  )
}
