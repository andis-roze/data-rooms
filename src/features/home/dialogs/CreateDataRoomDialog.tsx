import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'

interface CreateDataRoomDialogProps {
  open: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  onClose: () => void
  onDataRoomNameDraftChange: (value: string) => void
  onSubmit: () => void
}

export function CreateDataRoomDialog({
  open,
  dataRoomNameDraft,
  dataRoomNameError,
  onClose,
  onDataRoomNameDraftChange,
  onSubmit,
}: CreateDataRoomDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('dataroomDialogCreateDataRoomTitle')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label={t('dataroomFieldDataRoomName')}
          value={dataRoomNameDraft}
          onChange={(event) => {
            onDataRoomNameDraftChange(event.target.value)
          }}
          error={Boolean(dataRoomNameError)}
          helperText={dataRoomNameError ?? ' '}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dataroomActionCancel')}</Button>
        <Button onClick={onSubmit} variant="contained">
          {t('dataroomActionCreate')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
