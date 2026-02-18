import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface FolderDialogsProps {
  createFolderDialogOpen: boolean
  renameFolderDialogOpen: boolean
  deleteFolderDialogOpen: boolean
  folderNameDraft: string
  folderNameError: string | null
  activeFolderName: string
  targetFolderName: string | null
  folderDeleteSummary: { folderCount: number; fileCount: number }
  onCloseCreateFolderDialog: () => void
  onFolderNameChange: (value: string) => void
  onCreateFolder: () => void
  onCloseRenameFolderDialog: () => void
  onRenameFolder: () => void
  onCloseDeleteFolderDialog: () => void
  onDeleteFolder: () => void
}

export function FolderDialogs({
  createFolderDialogOpen,
  renameFolderDialogOpen,
  deleteFolderDialogOpen,
  folderNameDraft,
  folderNameError,
  activeFolderName,
  targetFolderName,
  folderDeleteSummary,
  onCloseCreateFolderDialog,
  onFolderNameChange,
  onCreateFolder,
  onCloseRenameFolderDialog,
  onRenameFolder,
  onCloseDeleteFolderDialog,
  onDeleteFolder,
}: FolderDialogsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Dialog open={createFolderDialogOpen} onClose={onCloseCreateFolderDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogCreateFolderTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFolderName')}
            value={folderNameDraft}
            onChange={(event) => {
              onFolderNameChange(event.target.value)
            }}
            error={Boolean(folderNameError)}
            helperText={folderNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onCreateFolder()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseCreateFolderDialog}>{t('dataroomActionCancel')}</Button>
          <Button onClick={onCreateFolder} variant="contained">
            {t('dataroomActionCreate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameFolderDialogOpen} onClose={onCloseRenameFolderDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameFolderTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFolderName')}
            value={folderNameDraft}
            onChange={(event) => {
              onFolderNameChange(event.target.value)
            }}
            error={Boolean(folderNameError)}
            helperText={folderNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onRenameFolder()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseRenameFolderDialog}>{t('dataroomActionCancel')}</Button>
          <Button onClick={onRenameFolder} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteFolderDialogOpen} onClose={onCloseDeleteFolderDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteFolderTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('dataroomDeleteFolderQuestion', {
              name: targetFolderName ?? activeFolderName,
            })}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteFolderImpact', {
              folderCount: folderDeleteSummary.folderCount,
              fileCount: folderDeleteSummary.fileCount,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteFolderDialog}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={onDeleteFolder}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
