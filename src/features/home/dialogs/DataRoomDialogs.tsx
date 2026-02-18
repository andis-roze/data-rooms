import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { CreateDataRoomDialog } from './CreateDataRoomDialog'

interface DataRoomDialogsProps {
  createDataRoomDialogOpen: boolean
  renameDataRoomDialogOpen: boolean
  deleteDataRoomDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  activeDataRoomName: string
  dataRoomDeleteSummary: { folderCount: number; fileCount: number }
  onCloseCreateDataRoomDialog: () => void
  onOpenDataRoomNameChange: (value: string) => void
  onCreateDataRoom: () => void
  onCloseRenameDataRoomDialog: () => void
  onRenameDataRoom: () => void
  onCloseDeleteDataRoomDialog: () => void
  onDeleteDataRoom: () => void
}

export function DataRoomDialogs({
  createDataRoomDialogOpen,
  renameDataRoomDialogOpen,
  deleteDataRoomDialogOpen,
  dataRoomNameDraft,
  dataRoomNameError,
  activeDataRoomName,
  dataRoomDeleteSummary,
  onCloseCreateDataRoomDialog,
  onOpenDataRoomNameChange,
  onCreateDataRoom,
  onCloseRenameDataRoomDialog,
  onRenameDataRoom,
  onCloseDeleteDataRoomDialog,
  onDeleteDataRoom,
}: DataRoomDialogsProps) {
  const { t } = useTranslation()

  return (
    <>
      <CreateDataRoomDialog
        open={createDataRoomDialogOpen}
        dataRoomNameDraft={dataRoomNameDraft}
        dataRoomNameError={dataRoomNameError}
        onClose={onCloseCreateDataRoomDialog}
        onDataRoomNameDraftChange={onOpenDataRoomNameChange}
        onSubmit={onCreateDataRoom}
      />

      <Dialog open={renameDataRoomDialogOpen} onClose={onCloseRenameDataRoomDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameDataRoomTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldDataRoomName')}
            value={dataRoomNameDraft}
            onChange={(event) => {
              onOpenDataRoomNameChange(event.target.value)
            }}
            error={Boolean(dataRoomNameError)}
            helperText={dataRoomNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onRenameDataRoom()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseRenameDataRoomDialog}>{t('dataroomActionCancel')}</Button>
          <Button onClick={onRenameDataRoom} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDataRoomDialogOpen} onClose={onCloseDeleteDataRoomDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteDataRoomTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteDataRoomQuestion', { name: activeDataRoomName })}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteDataRoomImpact', {
              folderCount: dataRoomDeleteSummary.folderCount,
              fileCount: dataRoomDeleteSummary.fileCount,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteDataRoomDialog}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={onDeleteDataRoom}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
