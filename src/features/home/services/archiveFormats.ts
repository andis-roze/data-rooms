export type SupportedArchiveKind = 'zip' | 'tar' | 'targz'
export type UploadFileKind = 'pdf' | SupportedArchiveKind | 'unsupportedArchive' | 'unsupported'

export const SUPPORTED_ARCHIVE_EXTENSIONS = ['.zip', '.tar', '.tar.gz', '.tgz'] as const
export const UNSUPPORTED_ARCHIVE_EXTENSIONS = ['.rar', '.7z', '.tar.bz2', '.tbz2', '.gz'] as const

const SUPPORTED_ARCHIVE_MIME_TYPES = {
  zip: ['application/zip', 'application/x-zip-compressed'],
  tar: ['application/x-tar'],
} as const

const UNSUPPORTED_ARCHIVE_MIME_TYPES = [
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-bzip2',
  'application/gzip',
  'application/x-gzip',
] as const

function hasExtension(fileName: string, extension: string): boolean {
  return fileName.toLocaleLowerCase().endsWith(extension)
}

export function detectSupportedArchiveKind(fileName: string, fileType: string): SupportedArchiveKind | null {
  const lowerName = fileName.toLocaleLowerCase()
  const lowerType = fileType.toLocaleLowerCase()

  if (hasExtension(lowerName, '.tar.gz') || hasExtension(lowerName, '.tgz')) {
    return 'targz'
  }

  if (
    hasExtension(lowerName, '.zip') ||
    SUPPORTED_ARCHIVE_MIME_TYPES.zip.some((mimeType) => lowerType === mimeType)
  ) {
    return 'zip'
  }

  if (
    hasExtension(lowerName, '.tar') ||
    SUPPORTED_ARCHIVE_MIME_TYPES.tar.some((mimeType) => lowerType === mimeType)
  ) {
    return 'tar'
  }

  return null
}

export function isUnsupportedArchive(fileName: string, fileType: string): boolean {
  const lowerName = fileName.toLocaleLowerCase()
  const lowerType = fileType.toLocaleLowerCase()

  if (UNSUPPORTED_ARCHIVE_EXTENSIONS.some((extension) => hasExtension(lowerName, extension))) {
    return true
  }

  return UNSUPPORTED_ARCHIVE_MIME_TYPES.some((mimeType) => lowerType === mimeType)
}
