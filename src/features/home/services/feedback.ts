const DEFAULT_FEEDBACK_TIMEOUT_MS = 6000

export function loadFeedbackTimeoutMs(): number {
  const rawValue = import.meta.env.VITE_FEEDBACK_TIMEOUT_MS

  if (rawValue === undefined) {
    return DEFAULT_FEEDBACK_TIMEOUT_MS
  }

  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return DEFAULT_FEEDBACK_TIMEOUT_MS
  }

  return Math.floor(parsedValue)
}

