import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import type { FeedbackState } from '../types'

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
