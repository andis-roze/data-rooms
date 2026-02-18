import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

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

  return (
    <>
      <Dialog open={renameFileDialogOpen} onClose={onCloseRenameFileDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameFileTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFileName')}
            value={fileNameDraft}
            onChange={(event) => {
              onFileNameChange(event.target.value)
            }}
            error={Boolean(fileNameError)}
            helperText={fileNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onRenameFile()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseRenameFileDialog}>{t('dataroomActionCancel')}</Button>
          <Button onClick={onRenameFile} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteFileDialogOpen} onClose={onCloseDeleteFileDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteFileTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteFileQuestion', { name: activeFileName ?? '' })}</Typography>
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
