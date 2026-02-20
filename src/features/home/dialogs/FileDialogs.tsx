import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { DialogEntityName } from './DialogEntityName'
import { NamePromptDialog } from './NamePromptDialog'

interface FileDialogsProps {
  renameFileDialogOpen: boolean
  deleteFileDialogOpen: boolean
  fileNameDraft: string
  fileNameError: string | null
  activeFileName: string | null
  onCloseRenameFileDialog: () => void
  onFileNameChange: (value: string) => void
  onRenameFile: () => void
  onCloseDeleteFileDialog: () => void
  onDeleteFile: () => void
}

export function FileDialogs({
  renameFileDialogOpen,
  deleteFileDialogOpen,
  fileNameDraft,
  fileNameError,
  activeFileName,
  onCloseRenameFileDialog,
  onFileNameChange,
  onRenameFile,
  onCloseDeleteFileDialog,
  onDeleteFile,
}: FileDialogsProps) {
  const { t } = useTranslation()
  const fileName = activeFileName?.trim()

  return (
    <>
      <NamePromptDialog
        open={renameFileDialogOpen}
        title={t('dataroomDialogRenameFileTitle')}
        label={t('dataroomFieldFileName')}
        value={fileNameDraft}
        errorText={fileNameError}
        cancelLabel={t('dataroomActionCancel')}
        submitLabel={t('dataroomActionRename')}
        onClose={onCloseRenameFileDialog}
        onValueChange={onFileNameChange}
        onSubmit={onRenameFile}
      />

      <Dialog open={deleteFileDialogOpen} onClose={onCloseDeleteFileDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteFileTitleConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteFileQuestionConfirmWithoutName')}</Typography>
          {fileName ? <DialogEntityName name={fileName} /> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteFileDialog}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={onDeleteFile}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
