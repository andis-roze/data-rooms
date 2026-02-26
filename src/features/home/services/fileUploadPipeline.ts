import {
  getFileNameValidationError,
  normalizeNodeName,
  preparePdfUpload,
  type DataRoomState,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { detectUploadFileKind, extractPdfFilesFromArchive } from './archivePdfImport'

type UploadFileAction = Extract<DataRoomAction, { type: 'dataroom/uploadFile' }>
export type UploadFileDispatchPayload = UploadFileAction['payload']
export type FileNameValidationError = Exclude<ReturnType<typeof getFileNameValidationError>, null>

export interface FileUploadPipelineCallbacks {
  createFileId: () => NodeId
  storeFileBlob: (fileId: NodeId, file: File) => Promise<void>
  dispatchUpload: (payload: UploadFileDispatchPayload) => void
}

export interface FileUploadPipelineParams {
  entities: DataRoomState
  uploadFolderId: NodeId
  selectedFiles: File[]
  callbacks: FileUploadPipelineCallbacks
}

export type FileUploadPipelineSingleError =
  | 'unsupportedArchive'
  | 'unsupportedFile'
  | 'archiveReadFailed'
  | 'archiveNoPdf'
  | 'invalidName'
  | 'duplicateName'
  | 'storageFailed'

export interface FileUploadPipelineResult {
  mode: 'single' | 'batch'
  uploadedCount: number
  unsupportedFileCount: number
  unsupportedArchiveCount: number
  archiveReadFailedCount: number
  archiveNoPdfCount: number
  invalidNameCount: number
  duplicateNameCount: number
  storageFailedCount: number
  lastUploadedFileId: NodeId | null
  singleError: FileUploadPipelineSingleError | null
  singleInvalidNameError: FileNameValidationError | null
}

const createEmptyResult = (mode: 'single' | 'batch'): FileUploadPipelineResult => ({
  mode,
  uploadedCount: 0,
  unsupportedFileCount: 0,
  unsupportedArchiveCount: 0,
  archiveReadFailedCount: 0,
  archiveNoPdfCount: 0,
  invalidNameCount: 0,
  duplicateNameCount: 0,
  storageFailedCount: 0,
  lastUploadedFileId: null,
  singleError: null,
  singleInvalidNameError: null,
})

export async function runFileUploadPipeline({
  entities,
  uploadFolderId,
  selectedFiles,
  callbacks,
}: FileUploadPipelineParams): Promise<FileUploadPipelineResult> {
  const uploadFolder = entities.foldersById[uploadFolderId]
  if (!uploadFolder) {
    return createEmptyResult(selectedFiles.length <= 1 ? 'single' : 'batch')
  }

  if (selectedFiles.length === 1) {
    const [selectedFile] = selectedFiles
    const uploadKind = detectUploadFileKind(selectedFile)
    const result = createEmptyResult('single')

    if (uploadKind === 'unsupportedArchive') {
      result.unsupportedArchiveCount = 1
      result.singleError = 'unsupportedArchive'
      return result
    }

    if (uploadKind === 'unsupported') {
      result.unsupportedFileCount = 1
      result.singleError = 'unsupportedFile'
      return result
    }

    if (uploadKind !== 'pdf') {
      try {
        const extractedPdfFiles = await extractPdfFilesFromArchive(selectedFile, uploadKind)
        if (extractedPdfFiles.length === 0) {
          result.archiveNoPdfCount = 1
          result.singleError = 'archiveNoPdf'
          return result
        }

        return runFileUploadPipeline({
          entities,
          uploadFolderId,
          selectedFiles: extractedPdfFiles,
          callbacks,
        })
      } catch {
        result.archiveReadFailedCount = 1
        result.singleError = 'archiveReadFailed'
        return result
      }
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const nameValidationError = getFileNameValidationError(preparedUpload.fileName)
    if (nameValidationError) {
      result.invalidNameCount = 1
      result.singleError = 'invalidName'
      result.singleInvalidNameError = nameValidationError
      return result
    }

    const existingFileNames = new Set(
      uploadFolder.fileIds
        .map((fileId) => entities.filesById[fileId])
        .filter((file): file is NonNullable<typeof file> => Boolean(file))
        .map((file) => normalizeNodeName(file.name)),
    )

    const normalizedFileName = normalizeNodeName(preparedUpload.fileName)
    if (existingFileNames.has(normalizedFileName)) {
      result.duplicateNameCount = 1
      result.singleError = 'duplicateName'
      return result
    }

    const fileId = callbacks.createFileId()
    try {
      await callbacks.storeFileBlob(fileId, selectedFile)
    } catch {
      result.storageFailedCount = 1
      result.singleError = 'storageFailed'
      return result
    }

    callbacks.dispatchUpload({
      parentFolderId: uploadFolder.id,
      fileId,
      fileName: preparedUpload.fileName,
      size: preparedUpload.size,
      mimeType: preparedUpload.mimeType,
    })
    result.uploadedCount = 1
    result.lastUploadedFileId = fileId
    return result
  }

  const result = createEmptyResult('batch')
  const uploadCandidates: File[] = []

  for (const selectedFile of selectedFiles) {
    const uploadKind = detectUploadFileKind(selectedFile)

    if (uploadKind === 'pdf') {
      uploadCandidates.push(selectedFile)
      continue
    }

    if (uploadKind === 'unsupportedArchive') {
      result.unsupportedArchiveCount += 1
      continue
    }

    if (uploadKind === 'unsupported') {
      result.unsupportedFileCount += 1
      continue
    }

    try {
      const extractedPdfFiles = await extractPdfFilesFromArchive(selectedFile, uploadKind)
      if (extractedPdfFiles.length === 0) {
        result.archiveNoPdfCount += 1
        continue
      }
      uploadCandidates.push(...extractedPdfFiles)
    } catch {
      result.archiveReadFailedCount += 1
    }
  }

  const existingFileNames = new Set(
    uploadFolder.fileIds
      .map((fileId) => entities.filesById[fileId])
      .filter((file): file is NonNullable<typeof file> => Boolean(file))
      .map((file) => normalizeNodeName(file.name)),
  )

  for (const selectedFile of uploadCandidates) {
    const preparedUpload = preparePdfUpload(selectedFile)
    const nameValidationError = getFileNameValidationError(preparedUpload.fileName)
    if (nameValidationError) {
      result.invalidNameCount += 1
      continue
    }

    const normalizedFileName = normalizeNodeName(preparedUpload.fileName)
    if (existingFileNames.has(normalizedFileName)) {
      result.duplicateNameCount += 1
      continue
    }

    const fileId = callbacks.createFileId()
    try {
      await callbacks.storeFileBlob(fileId, selectedFile)
    } catch {
      result.storageFailedCount += 1
      continue
    }

    callbacks.dispatchUpload({
      parentFolderId: uploadFolder.id,
      fileId,
      fileName: preparedUpload.fileName,
      size: preparedUpload.size,
      mimeType: preparedUpload.mimeType,
    })
    existingFileNames.add(normalizedFileName)
    result.uploadedCount += 1
    result.lastUploadedFileId = fileId
  }

  return result
}
