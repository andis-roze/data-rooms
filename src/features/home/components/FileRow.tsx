import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode } from '../../dataroom/model'
import { formatFileSize, formatUpdatedAt } from '../services/formatters'

interface FileRowProps {
  itemId: string
  file: FileNode
  locale: string
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

export function FileRow({ itemId, file, locale, onOpenViewFile, onOpenRenameFile, onOpenDeleteFile }: FileRowProps) {
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
