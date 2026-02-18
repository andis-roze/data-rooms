import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { NamePromptDialog } from './NamePromptDialog'

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
      <NamePromptDialog
        open={createFolderDialogOpen}
        title={t('dataroomDialogCreateFolderTitle')}
        label={t('dataroomFieldFolderName')}
        value={folderNameDraft}
        errorText={folderNameError}
        cancelLabel={t('dataroomActionCancel')}
        submitLabel={t('dataroomActionCreate')}
        onClose={onCloseCreateFolderDialog}
        onValueChange={onFolderNameChange}
        onSubmit={onCreateFolder}
      />

      <NamePromptDialog
        open={renameFolderDialogOpen}
        title={t('dataroomDialogRenameFolderTitle')}
        label={t('dataroomFieldFolderName')}
        value={folderNameDraft}
        errorText={folderNameError}
        cancelLabel={t('dataroomActionCancel')}
        submitLabel={t('dataroomActionRename')}
        onClose={onCloseRenameFolderDialog}
        onValueChange={onFolderNameChange}
        onSubmit={onRenameFolder}
      />

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
