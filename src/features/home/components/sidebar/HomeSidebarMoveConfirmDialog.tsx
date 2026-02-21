import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface HomeSidebarMoveConfirmDialogProps {
  open: boolean
  itemCount: number
  pendingDestinationFolderName: string | null
  onClose: () => void
  onConfirm: () => void
}

export function HomeSidebarMoveConfirmDialog({
  open,
  itemCount,
  pendingDestinationFolderName,
  onClose,
  onConfirm,
}: HomeSidebarMoveConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('dataroomDialogMoveTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('dataroomMoveSelectedQuestion', { count: itemCount })}</Typography>
        {pendingDestinationFolderName ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {`${t('dataroomFieldDestinationFolder')}: ${pendingDestinationFolderName}`}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dataroomActionCancel')}</Button>
        <Button variant="contained" onClick={onConfirm}>
          {t('dataroomActionMove')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
