import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode, NodeId } from '../../dataroom/model'
import { formatPathForDisplay, formatUpdatedAt } from '../services/formatters'

interface FileRowProps {
  itemId: string
  file: FileNode
  rowGridTemplate: string
  locale: string
  selected: boolean
  onToggleSelect: (itemId: NodeId) => void
  onOpenViewFile: (file: FileNode) => void
  onOpenRenameFile: (file: FileNode) => void
  onOpenDeleteFile: (file: FileNode) => void
}

const mobileGridTemplate = '36px minmax(0,1fr) auto'

const actionGridTemplate = {
  xs: 'repeat(2, max-content)',
  md: 'repeat(2, max-content)',
}

export function FileRow({
  itemId,
  file,
  rowGridTemplate,
  locale,
  selected,
  onToggleSelect,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
}: FileRowProps) {
  const { t } = useTranslation()

  return (
    <ListItem key={itemId} disablePadding sx={{ px: 2, py: 1 }}>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: mobileGridTemplate, md: rowGridTemplate },
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Checkbox
            size="small"
            checked={selected}
            inputProps={{ 'aria-label': t('dataroomSelectionSelectItemAria', { name: file.name }) }}
            onChange={() => onToggleSelect(file.id)}
          />
        </Box>
        <Box
          sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center' }}
          title={t('dataroomFileItemType')}
          aria-label={t('dataroomFileItemType')}
        >
          <DescriptionOutlinedIcon fontSize="small" color="action" />
        </Box>
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
          aria-label={t('dataroomAriaViewFile', { name: file.name })}
          onClick={() => onOpenViewFile(file)}
          title={file.name}
        >
          <Typography noWrap>{formatPathForDisplay(file.name)}</Typography>
        </Button>
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
          <Tooltip title={t('dataroomActionRenameFile')}>
            <IconButton
              size="small"
              aria-label={t('dataroomAriaRenameFile', { name: file.name })}
              onClick={() => onOpenRenameFile(file)}
            >
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('dataroomActionDeleteFile')}>
            <IconButton
              size="small"
              color="error"
              aria-label={t('dataroomAriaDeleteFile', { name: file.name })}
              onClick={() => onOpenDeleteFile(file)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </ListItem>
  )
}
