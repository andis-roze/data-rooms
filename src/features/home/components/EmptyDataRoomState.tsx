import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface EmptyDataRoomStateProps {
  title: string
  body: string
  actionLabel: string
  onCreateDataRoom: () => void
  children?: ReactNode
}

export function EmptyDataRoomState({
  title,
  body,
  actionLabel,
  onCreateDataRoom,
  children,
}: EmptyDataRoomStateProps) {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
        <Stack spacing={2} role="status" aria-live="polite">
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {title}
          </Typography>
          <Typography color="text.secondary">{body}</Typography>
          <Button variant="contained" onClick={onCreateDataRoom}>
            {actionLabel}
          </Button>
        </Stack>
      </Paper>
      {children}
    </Container>
  )
}
