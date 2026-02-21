import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface ContentSelectionBannerProps {
  selectedContentItemCount: number
  onOpenMoveSelectedContentDialog: () => void
  onOpenDeleteSelectedContentDialog: () => void
  onClearContentItemSelection: () => void
}

export function ContentSelectionBanner({
  selectedContentItemCount,
  onOpenMoveSelectedContentDialog,
  onOpenDeleteSelectedContentDialog,
  onClearContentItemSelection,
}: ContentSelectionBannerProps) {
  const { t } = useTranslation()

  if (selectedContentItemCount <= 0) {
    return null
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 2,
        py: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ fontWeight: 600 }}>
        {t('dataroomSelectionCount', { count: selectedContentItemCount })}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={onOpenMoveSelectedContentDialog}>
          {t('dataroomActionMove')}
        </Button>
        <Button color="error" variant="contained" onClick={onOpenDeleteSelectedContentDialog}>
          {t('dataroomActionDeleteSelected')}
        </Button>
        <Button variant="text" onClick={onClearContentItemSelection}>
          {t('dataroomActionClearSelection')}
        </Button>
      </Stack>
    </Box>
  )
}
