import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'

interface ContentActionBarProps {
  onCreateFolder: () => void
  onUploadPdf: () => void
}

export function ContentActionBar({
  onCreateFolder,
  onUploadPdf,
}: ContentActionBarProps) {
  const { t } = useTranslation()

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Button variant="contained" onClick={onCreateFolder}>
        {t('dataroomActionCreateFolder')}
      </Button>
      <Button variant="text" onClick={onUploadPdf}>
        {t('dataroomActionUploadPdf')}
      </Button>
    </Stack>
  )
}
