import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { CreateDataRoomDialog } from './CreateDataRoomDialog'
import { NamePromptDialog } from './NamePromptDialog'

// Handles create/rename/delete dialogs for data room actions.
interface DataRoomDialogsProps {
  createDataRoomDialogOpen: boolean
  renameDataRoomDialogOpen: boolean
  deleteDataRoomDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  activeDataRoomName: string
  dataRoomDeleteSummary: { folderCount: number; fileCount: number }
  onCloseCreateDataRoomDialog: () => void
  onDataRoomNameChange: (value: string) => void
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
  onDataRoomNameChange,
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
        onDataRoomNameDraftChange={onDataRoomNameChange}
        onSubmit={onCreateDataRoom}
      />

      <NamePromptDialog
        open={renameDataRoomDialogOpen}
        title={t('dataroomDialogRenameDataRoomTitle')}
        label={t('dataroomFieldDataRoomName')}
        value={dataRoomNameDraft}
        errorText={dataRoomNameError}
        cancelLabel={t('dataroomActionCancel')}
        submitLabel={t('dataroomActionRename')}
        onClose={onCloseRenameDataRoomDialog}
        onValueChange={onDataRoomNameChange}
        onSubmit={onRenameDataRoom}
      />

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
