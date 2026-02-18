import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getFileBlob, type NodeId } from '../../dataroom/model'

interface FilePreviewDialogProps {
  viewFileDialogOpen: boolean
  activeFileId: NodeId | null
  activeFileName: string | null
  onCloseViewFileDialog: () => void
}

export function FilePreviewDialog({
  viewFileDialogOpen,
  activeFileId,
  activeFileName,
  onCloseViewFileDialog,
}: FilePreviewDialogProps) {
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!viewFileDialogOpen || !activeFileId) {
      setPreviewUrl(null)
      setIsLoading(false)
      return
    }

    let disposed = false
    let createdObjectUrl: string | null = null

    setIsLoading(true)

    const loadPreview = async () => {
      try {
        const blob = await getFileBlob(activeFileId)

        if (disposed) {
          return
        }

        if (!blob) {
          setPreviewUrl(null)
          return
        }

        const url = URL.createObjectURL(blob)
        createdObjectUrl = url
        setPreviewUrl(url)
      } catch {
        if (!disposed) {
          setPreviewUrl(null)
        }
      } finally {
        if (!disposed) {
          setIsLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      disposed = true

      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl)
      }
    }
  }, [activeFileId, viewFileDialogOpen])

  return (
    <Dialog open={viewFileDialogOpen} onClose={onCloseViewFileDialog} fullWidth maxWidth="md">
      <DialogTitle>{activeFileName ?? t('dataroomFilePreviewTitle')}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box
            role="status"
            aria-live="polite"
            aria-label={t('dataroomFilePreviewLoading')}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
          >
            <CircularProgress />
            <Typography color="text.secondary">{t('dataroomFilePreviewLoading')}</Typography>
          </Box>
        ) : null}

        {!isLoading && previewUrl && activeFileName ? (
          <Box
            component="iframe"
            title={activeFileName}
            src={previewUrl}
            aria-busy={isLoading}
            sx={{ width: '100%', minHeight: '70vh', border: 0 }}
          />
        ) : null}

        {!isLoading && (!previewUrl || !activeFileName) ? (
          <Typography color="text.secondary">{t('dataroomFilePreviewUnavailable')}</Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseViewFileDialog}>{t('dataroomActionClose')}</Button>
      </DialogActions>
    </Dialog>
  )
}
