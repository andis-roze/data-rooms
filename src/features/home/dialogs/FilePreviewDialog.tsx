import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface FilePreviewDialogProps {
  viewFileDialogOpen: boolean
  activeFileName: string | null
  activeFileObjectUrl: string | null
  onCloseViewFileDialog: () => void
}

export function FilePreviewDialog({
  viewFileDialogOpen,
  activeFileName,
  activeFileObjectUrl,
  onCloseViewFileDialog,
}: FilePreviewDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={viewFileDialogOpen} onClose={onCloseViewFileDialog} fullWidth maxWidth="md">
      <DialogTitle>{activeFileName ?? t('dataroomFilePreviewTitle')}</DialogTitle>
      <DialogContent>
        {activeFileObjectUrl && activeFileName ? (
          <Box component="iframe" title={activeFileName} src={activeFileObjectUrl} sx={{ width: '100%', minHeight: '70vh', border: 0 }} />
        ) : (
          <Typography color="text.secondary">{t('dataroomFilePreviewUnavailable')}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseViewFileDialog}>{t('dataroomActionClose')}</Button>
      </DialogActions>
    </Dialog>
  )
}
