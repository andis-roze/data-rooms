export interface PreparedPdfUpload {
  fileName: string
  size: number
  mimeType: 'application/pdf'
  objectUrl: string
}

export function getPdfUploadValidationError(file: File): string | null {
  const hasPdfMimeType = file.type === 'application/pdf'
  const hasPdfExtension = file.name.toLocaleLowerCase().endsWith('.pdf')

  if (!hasPdfMimeType && !hasPdfExtension) {
    return 'Only PDF files are allowed.'
  }

  return null
}

function createObjectUrl(file: File): string {
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    return URL.createObjectURL(file)
  }

  return ''
}

export function preparePdfUpload(file: File): PreparedPdfUpload {
  return {
    fileName: file.name.trim(),
    size: file.size,
    mimeType: 'application/pdf',
    objectUrl: createObjectUrl(file),
  }
}
