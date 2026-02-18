import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FeedbackState } from './types'

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

interface HomeDialogsProps {
  createDataRoomDialogOpen: boolean
  renameDataRoomDialogOpen: boolean
  deleteDataRoomDialogOpen: boolean
  createDialogOpen: boolean
  renameDialogOpen: boolean
  deleteDialogOpen: boolean
  renameFileDialogOpen: boolean
  deleteFileDialogOpen: boolean
  viewFileDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  folderNameDraft: string
  folderNameError: string | null
  fileNameDraft: string
  fileNameError: string | null
  activeDataRoomName: string
  activeFolderName: string
  targetFolderName: string | null
  activeFileName: string | null
  activeFileObjectUrl: string | null
  dataRoomDeleteSummary: { folderCount: number; fileCount: number }
  folderDeleteSummary: { folderCount: number; fileCount: number }
  onCloseCreateDataRoomDialog: () => void
  onOpenDataRoomNameChange: (value: string) => void
  onCreateDataRoom: () => void
  onCloseRenameDataRoomDialog: () => void
  onRenameDataRoom: () => void
  onCloseDeleteDataRoomDialog: () => void
  onDeleteDataRoom: () => void
  onCloseCreateFolderDialog: () => void
  onFolderNameChange: (value: string) => void
  onCreateFolder: () => void
  onCloseRenameFolderDialog: () => void
  onRenameFolder: () => void
  onCloseDeleteFolderDialog: () => void
  onDeleteFolder: () => void
  onCloseRenameFileDialog: () => void
  onFileNameChange: (value: string) => void
  onRenameFile: () => void
  onCloseDeleteFileDialog: () => void
  onDeleteFile: () => void
  onCloseViewFileDialog: () => void
}

export function HomeDialogs({
  createDataRoomDialogOpen,
  renameDataRoomDialogOpen,
  deleteDataRoomDialogOpen,
  createDialogOpen,
  renameDialogOpen,
  deleteDialogOpen,
  renameFileDialogOpen,
  deleteFileDialogOpen,
  viewFileDialogOpen,
  dataRoomNameDraft,
  dataRoomNameError,
  folderNameDraft,
  folderNameError,
  fileNameDraft,
  fileNameError,
  activeDataRoomName,
  activeFolderName,
  targetFolderName,
  activeFileName,
  activeFileObjectUrl,
  dataRoomDeleteSummary,
  folderDeleteSummary,
  onCloseCreateDataRoomDialog,
  onOpenDataRoomNameChange,
  onCreateDataRoom,
  onCloseRenameDataRoomDialog,
  onRenameDataRoom,
  onCloseDeleteDataRoomDialog,
  onDeleteDataRoom,
  onCloseCreateFolderDialog,
  onFolderNameChange,
  onCreateFolder,
  onCloseRenameFolderDialog,
  onRenameFolder,
  onCloseDeleteFolderDialog,
  onDeleteFolder,
  onCloseRenameFileDialog,
  onFileNameChange,
  onRenameFile,
  onCloseDeleteFileDialog,
  onDeleteFile,
  onCloseViewFileDialog,
}: HomeDialogsProps) {
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

      <Dialog open={createDialogOpen} onClose={onCloseCreateFolderDialog} fullWidth maxWidth="xs">
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

      <Dialog open={renameDialogOpen} onClose={onCloseRenameFolderDialog} fullWidth maxWidth="xs">
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

      <Dialog open={deleteDialogOpen} onClose={onCloseDeleteFolderDialog} fullWidth maxWidth="xs">
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
    </>
  )
}

interface FeedbackStackProps {
  feedbackQueue: FeedbackState[]
  onDismissFeedback: (id: number) => void
}

export function FeedbackStack({ feedbackQueue, onDismissFeedback }: FeedbackStackProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.snackbar,
        width: { xs: 'calc(100vw - 32px)', sm: 420 },
        maxWidth: '100%',
      }}
    >
      {feedbackQueue.map((feedback) => (
        <Alert key={feedback.id} severity={feedback.severity} variant="filled" onClose={() => onDismissFeedback(feedback.id)}>
          {feedback.message}
        </Alert>
      ))}
    </Stack>
  )
}
