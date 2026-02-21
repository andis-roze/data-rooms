import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { DialogEntityName } from '../../dialogs/DialogEntityName'

interface DeleteSelectedContentDialogProps {
  open: boolean
  deleteSelectedContentItemCount: number
  deleteSelectedFileCount: number
  deleteSelectedFolderCount: number
  selectedContentItemNames: string[]
  onClose: () => void
  onConfirmDelete: () => Promise<void>
}

export function DeleteSelectedContentDialog({
  open,
  deleteSelectedContentItemCount,
  deleteSelectedFileCount,
  deleteSelectedFolderCount,
  selectedContentItemNames,
  onClose,
  onConfirmDelete,
}: DeleteSelectedContentDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('dataroomDialogDeleteSelectedTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('dataroomDeleteSelectedQuestion', { count: deleteSelectedContentItemCount })}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t('dataroomDeleteSelectedImpact', { fileCount: deleteSelectedFileCount, folderCount: deleteSelectedFolderCount })}
        </Typography>
        {selectedContentItemNames.slice(0, 3).map((name, index) => (
          <DialogEntityName key={`${name}-${index}`} name={name} maxLength={44} />
        ))}
        {selectedContentItemNames.length > 3 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomSelectionMoreItems', { count: selectedContentItemNames.length - 3 })}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dataroomActionCancel')}</Button>
        <Button color="error" variant="contained" onClick={() => void onConfirmDelete()}>
          {t('dataroomActionDelete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
