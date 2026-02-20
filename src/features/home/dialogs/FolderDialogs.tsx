import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { DialogEntityName } from './DialogEntityName'
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
  const folderName = (targetFolderName ?? activeFolderName).trim()
  const nestedItemCount = Math.max(folderDeleteSummary.folderCount - 1, 0) + folderDeleteSummary.fileCount

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
        <DialogTitle>{t('dataroomDialogDeleteFolderTitleConfirm')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteFolderQuestionConfirmWithoutName')}</Typography>
          <DialogEntityName name={folderName} />
          {nestedItemCount > 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {nestedItemCount === 1
                ? t('dataroomDeleteFolderNestedItemsSingle')
                : t('dataroomDeleteFolderNestedItemsMultiple', { count: nestedItemCount })}
            </Typography>
          ) : null}
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
