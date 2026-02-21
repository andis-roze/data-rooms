import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type TFunction } from 'i18next'
import { CreateDataRoomDialog } from '../../dialogs/CreateDataRoomDialog'

interface HomePageEmptyStateProps {
  t: TFunction<'common'>
  isCreateDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  onOpenCreateDialog: () => void
  onCloseCreateDialog: () => void
  onDataRoomNameDraftChange: (value: string) => void
  onCreateDataRoom: () => void
}

export function HomePageEmptyState({
  t,
  isCreateDialogOpen,
  dataRoomNameDraft,
  dataRoomNameError,
  onOpenCreateDialog,
  onCloseCreateDialog,
  onDataRoomNameDraftChange,
  onCreateDataRoom,
}: HomePageEmptyStateProps) {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
        <Stack spacing={2} role="status" aria-live="polite">
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {t('dataroomNoDataRoomTitle')}
          </Typography>
          <Typography color="text.secondary">{t('dataroomNoDataRoomBody')}</Typography>
          <Button variant="contained" onClick={onOpenCreateDialog}>
            {t('dataroomActionCreateDataRoom')}
          </Button>
        </Stack>
      </Paper>
      <CreateDataRoomDialog
        open={isCreateDialogOpen}
        dataRoomNameDraft={dataRoomNameDraft}
        dataRoomNameError={dataRoomNameError}
        onClose={onCloseCreateDialog}
        onDataRoomNameDraftChange={onDataRoomNameDraftChange}
        onSubmit={onCreateDataRoom}
      />
    </Container>
  )
}
