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
