import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
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
  md: 'minmax(0,1fr) 120px 130px 190px',
}

const actionGridTemplate = {
  xs: 'repeat(2, max-content)',
  md: 'repeat(2, minmax(84px, 1fr))',
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
          {isParentNavigation ? (
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
