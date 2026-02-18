import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { useEffect, useRef } from 'react'
import type { FeedbackState } from '../types'

interface FeedbackStackProps {
  feedbackQueue: FeedbackState[]
  timeoutMs: number
  onDismissFeedback: (id: number) => void
}

export function FeedbackStack({ feedbackQueue, timeoutMs, onDismissFeedback }: FeedbackStackProps) {
  const timersRef = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    if (timeoutMs <= 0) {
      return
    }

    feedbackQueue.forEach((feedback) => {
      if (timersRef.current.has(feedback.id)) {
        return
      }

      const timerId = window.setTimeout(() => {
        onDismissFeedback(feedback.id)
        timersRef.current.delete(feedback.id)
      }, timeoutMs)

      timersRef.current.set(feedback.id, timerId)
    })

    const activeIds = new Set(feedbackQueue.map((item) => item.id))
    timersRef.current.forEach((timerId, feedbackId) => {
      if (activeIds.has(feedbackId)) {
        return
      }

      window.clearTimeout(timerId)
      timersRef.current.delete(feedbackId)
    })
  }, [feedbackQueue, onDismissFeedback, timeoutMs])

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      timers.clear()
    }
  }, [])

  return (
    <Stack
      spacing={1}
      aria-live="polite"
      aria-atomic="false"
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
