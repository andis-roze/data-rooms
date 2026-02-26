import { gunzipSync, unzipSync } from 'fflate'
import {
  detectSupportedArchiveKind,
  isUnsupportedArchive,
  SUPPORTED_ARCHIVE_EXTENSIONS,
  type SupportedArchiveKind,
  type UploadFileKind,
} from './archiveFormats'

export type { SupportedArchiveKind, UploadFileKind } from './archiveFormats'

function sanitizeArchiveEntryName(entryName: string): string | null {
  const normalized = entryName.replaceAll('\\', '/')
  const segments = normalized.split('/').filter((segment) => segment && segment !== '.' && segment !== '..')
  if (segments.length === 0) {
    return null
  }

  return segments[segments.length - 1] ?? null
}

function isPdfName(fileName: string): boolean {
  return fileName.toLocaleLowerCase().endsWith('.pdf')
}

function normalizeToFileBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const normalizedBuffer = new ArrayBuffer(bytes.length)
  const normalized = new Uint8Array(normalizedBuffer)
  normalized.set(bytes)
  return normalized
}

const TAR_BLOCK_SIZE = 512

function decodeTarString(bytes: Uint8Array, start: number, length: number): string {
  const view = bytes.subarray(start, start + length)
  const nullIndex = view.indexOf(0)
  const end = nullIndex >= 0 ? nullIndex : view.length
  return new TextDecoder().decode(view.subarray(0, end)).trim()
}

function parseTarOctal(bytes: Uint8Array, start: number, length: number): number {
  const raw = decodeTarString(bytes, start, length).replace(/\0/g, '').trim()
  if (!raw) {
    return 0
  }

  return Number.parseInt(raw, 8)
}

function isZeroTarBlock(bytes: Uint8Array, offset: number): boolean {
  for (let index = offset; index < offset + TAR_BLOCK_SIZE; index += 1) {
    if (bytes[index] !== 0) {
      return false
    }
  }
  return true
}

export function detectUploadFileKind(file: File): UploadFileKind {
  const lowerName = file.name.toLocaleLowerCase()
  const lowerType = file.type.toLocaleLowerCase()

  if (lowerName.endsWith('.pdf') || lowerType === 'application/pdf') {
    return 'pdf'
  }

  const archiveKind = detectSupportedArchiveKind(lowerName, lowerType)
  if (archiveKind) {
    return archiveKind
  }

  if (isUnsupportedArchive(lowerName, lowerType)) {
    return 'unsupportedArchive'
  }

  return 'unsupported'
}

async function extractPdfFromZip(archiveFile: File): Promise<File[]> {
  const bytes = new Uint8Array(await archiveFile.arrayBuffer())
  const entries = unzipSync(bytes)
  const extractedFiles: File[] = []

  for (const [entryName, entryBytes] of Object.entries(entries)) {
    const safeName = sanitizeArchiveEntryName(entryName)
    if (!safeName || !isPdfName(safeName)) {
      continue
    }
    extractedFiles.push(new File([normalizeToFileBytes(entryBytes)], safeName, { type: 'application/pdf' }))
  }

  return extractedFiles
}

async function extractPdfFromTarBytes(archiveBytes: Uint8Array): Promise<File[]> {
  const extractedFiles: File[] = []
  let offset = 0

  while (offset + TAR_BLOCK_SIZE <= archiveBytes.length) {
    if (isZeroTarBlock(archiveBytes, offset)) {
      break
    }

    const entryName = decodeTarString(archiveBytes, offset, 100)
    const entryPrefix = decodeTarString(archiveBytes, offset + 345, 155)
    const fullName = entryPrefix ? `${entryPrefix}/${entryName}` : entryName
    const entryType = archiveBytes[offset + 156]
    const entrySize = parseTarOctal(archiveBytes, offset + 124, 12)

    if (!Number.isFinite(entrySize) || entrySize < 0) {
      throw new Error('Archive contains an invalid TAR entry size')
    }

    const dataStart = offset + TAR_BLOCK_SIZE
    const dataEnd = dataStart + entrySize
    if (dataEnd > archiveBytes.length) {
      throw new Error('Archive contains a truncated TAR entry')
    }

    if ((entryType === 0 || entryType === 48) && fullName) {
      const safeName = sanitizeArchiveEntryName(fullName)
      if (safeName && isPdfName(safeName)) {
        extractedFiles.push(
          new File([normalizeToFileBytes(archiveBytes.subarray(dataStart, dataEnd))], safeName, {
            type: 'application/pdf',
          }),
        )
      }
    }

    const paddedSize = Math.ceil(entrySize / TAR_BLOCK_SIZE) * TAR_BLOCK_SIZE
    offset = dataStart + paddedSize
  }

  return extractedFiles
}

async function extractPdfFromTar(archiveFile: File): Promise<File[]> {
  const bytes = new Uint8Array(await archiveFile.arrayBuffer())
  return extractPdfFromTarBytes(bytes)
}

async function extractPdfFromTarGz(archiveFile: File): Promise<File[]> {
  const gzippedBytes = new Uint8Array(await archiveFile.arrayBuffer())
  const tarBytes = gunzipSync(gzippedBytes)
  return extractPdfFromTarBytes(tarBytes)
}

const ARCHIVE_EXTRACTORS: Record<SupportedArchiveKind, (archiveFile: File) => Promise<File[]>> = {
  zip: extractPdfFromZip,
  tar: extractPdfFromTar,
  targz: extractPdfFromTarGz,
}

export async function extractPdfFilesFromArchive(
  archiveFile: File,
  archiveKind: SupportedArchiveKind,
): Promise<File[]> {
  return ARCHIVE_EXTRACTORS[archiveKind](archiveFile)
}

export function getSupportedArchiveExtensions(): string[] {
  return [...SUPPORTED_ARCHIVE_EXTENSIONS]
}
