import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { NodeId } from '../../../dataroom/model'
import { DialogEntityName } from '../../dialogs/DialogEntityName'
import { truncateMiddle } from '../../services/formatters'

interface MoveDestinationOption {
  id: NodeId
  name: string
  depth: number
  path: string
  parentPath: string | null
}

interface MoveContentDialogProps {
  open: boolean
  moveItemCount: number
  moveItemNames: string[]
  moveDestinationFolderId: NodeId | null
  moveDestinationFolderOptions: MoveDestinationOption[]
  moveValidationError: string | null
  onClose: () => void
  onMoveDestinationFolderChange: (folderId: NodeId) => void
  onConfirmMove: () => void
}

export function MoveContentDialog({
  open,
  moveItemCount,
  moveItemNames,
  moveDestinationFolderId,
  moveDestinationFolderOptions,
  moveValidationError,
  onClose,
  onMoveDestinationFolderChange,
  onConfirmMove,
}: MoveContentDialogProps) {
  const { t } = useTranslation()
  const formatMoveOptionLabel = (name: string) => truncateMiddle(name, 56)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('dataroomDialogMoveTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('dataroomMoveSelectedQuestion', { count: moveItemCount })}</Typography>
        {moveItemNames.slice(0, 3).map((name, index) => (
          <DialogEntityName key={`${name}-${index}`} name={name} maxLength={36} />
        ))}
        {moveItemNames.length > 3 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomSelectionMoreItems', { count: moveItemNames.length - 3 })}
          </Typography>
        ) : null}
        <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{t('dataroomFieldDestinationFolder')}</Typography>
        <Paper variant="outlined" sx={{ maxHeight: 220, overflowY: 'auto' }}>
          <List dense disablePadding aria-label={t('dataroomFieldDestinationFolder')}>
            {moveDestinationFolderOptions.map((folderOption) => {
              const displayLabel = formatMoveOptionLabel(folderOption.name)
              const displayParentPath = folderOption.parentPath ? truncateMiddle(folderOption.parentPath, 72) : null
              const isTruncated =
                displayLabel !== folderOption.name ||
                (folderOption.parentPath ? displayParentPath !== folderOption.parentPath : false)
              return (
                <ListItemButton
                  key={folderOption.id}
                  selected={moveDestinationFolderId === folderOption.id}
                  onClick={() => onMoveDestinationFolderChange(folderOption.id)}
                  aria-label={folderOption.path}
                  sx={{ pl: 1 + folderOption.depth * 2 }}
                >
                  <Tooltip title={folderOption.path} disableHoverListener={!isTruncated}>
                    <ListItemText
                      primary={displayLabel}
                      secondary={displayParentPath}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontWeight: 500,
                      }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        color: 'text.secondary',
                      }}
                    />
                  </Tooltip>
                </ListItemButton>
              )
            })}
          </List>
        </Paper>
        {moveValidationError ? (
          <Typography color="error" variant="body2">
            {moveValidationError}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dataroomActionCancel')}</Button>
        <Button variant="contained" onClick={onConfirmMove} disabled={Boolean(moveValidationError)}>
          {t('dataroomActionMove')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
