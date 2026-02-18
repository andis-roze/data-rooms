export interface PreparedPdfUpload {
  fileName: string
  size: number
  mimeType: 'application/pdf'
}

export type PdfUploadValidationError = 'invalidPdf'

export function getPdfUploadValidationError(file: File): PdfUploadValidationError | null {
  const hasPdfMimeType = file.type === 'application/pdf'
  const hasPdfExtension = file.name.toLocaleLowerCase().endsWith('.pdf')

  if (!hasPdfMimeType && !hasPdfExtension) {
    return 'invalidPdf'
  }

  return null
}

export function preparePdfUpload(file: File): PreparedPdfUpload {
  return {
    fileName: file.name.trim(),
    size: file.size,
    mimeType: 'application/pdf',
  }
}
