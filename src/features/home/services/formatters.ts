export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function formatUpdatedAt(value: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

const ELLIPSIS = '...'

export function truncateMiddle(value: string, maxLength: number): string {
  if (maxLength <= 0) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  if (maxLength <= ELLIPSIS.length) {
    return ELLIPSIS.slice(0, maxLength)
  }

  const visibleCount = maxLength - ELLIPSIS.length
  const startCount = Math.ceil(visibleCount / 2)
  const endCount = Math.floor(visibleCount / 2)

  return `${value.slice(0, startCount)}${ELLIPSIS}${value.slice(value.length - endCount)}`
}

export function formatPathForDisplay(path: string, maxLength = 48): string {
  if (path.length <= maxLength) {
    return path
  }

  const separator = path.includes('\\') ? '\\' : '/'
  const isAbsoluteUnix = path.startsWith('/')
  const isAbsoluteWindows = /^[a-zA-Z]:[\\/]/.test(path)
  const segments = path.split(/[\\/]+/).filter(Boolean)

  if (segments.length >= 2) {
    const startCount = isAbsoluteUnix || isAbsoluteWindows ? 2 : 1
    const startSegments = segments.slice(0, startCount)
    const fileName = segments[segments.length - 1]
    const startPath = startSegments.join(separator)
    const absolutePrefix = isAbsoluteUnix ? separator : ''
    const candidate = `${absolutePrefix}${startPath}${separator}${ELLIPSIS}${separator}${fileName}`

    if (candidate.length <= maxLength) {
      return candidate
    }

    return `${ELLIPSIS}${separator}${fileName}`
  }

  return truncateMiddle(path, maxLength)
}
