import { useRef, useState } from 'react'
import { loadFeedbackTimeoutMs } from '../services/feedback'
import type { FeedbackState } from '../types'

export function useFeedbackQueue() {
  const feedbackIdRef = useRef(0)
  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackState[]>([])
  const feedbackTimeoutMs = loadFeedbackTimeoutMs()

  const enqueueFeedback = (message: string, severity: FeedbackState['severity']) => {
    setFeedbackQueue((previous) => [...previous, { id: feedbackIdRef.current++, message, severity }])
  }

  const dismissFeedback = (id: number) => {
    setFeedbackQueue((previous) => previous.filter((item) => item.id !== id))
  }

  return {
    feedbackQueue,
    feedbackTimeoutMs,
    enqueueFeedback,
    dismissFeedback,
  }
}
