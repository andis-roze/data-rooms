import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import {
  getFileNameValidationError,
  hasDuplicateFileName,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'
import type { FileBlobStorageService } from '../services/fileBlobStorage'
import { runFileUploadPipeline } from '../services/fileUploadPipeline'
import { getFileNameValidationMessage } from './nameValidationMessages'

interface UseFileActionsParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeFolder: Folder | null
  activeFile: FileNode | null
  fileNameDraft: string
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setHighlightedContentItemId: Dispatch<SetStateAction<NodeId | null>>
  fileBlobStorage: FileBlobStorageService
  setActiveFileId: Dispatch<SetStateAction<NodeId | null>>
  setFileNameDraft: Dispatch<SetStateAction<string>>
  setFileNameError: Dispatch<SetStateAction<string | null>>
  setIsRenameFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsDeleteFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsViewFileDialogOpen: Dispatch<SetStateAction<boolean>>
}

type FileNameValidationResult = { ok: true } | { ok: false; message: string }
interface UploadFilesOptions {
  parentFolderId?: NodeId
}

export function useFileActions({
  t,
  entities,
  dispatch,
  activeFolder,
  activeFile,
  fileNameDraft,
  enqueueFeedback,
  setHighlightedContentItemId,
  fileBlobStorage,
  setActiveFileId,
  setFileNameDraft,
  setFileNameError,
  setIsRenameFileDialogOpen,
  setIsDeleteFileDialogOpen,
  setIsViewFileDialogOpen,
}: UseFileActionsParams) {
  const clearUploadInput = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = ''
  }

  const selectActiveFile = (file: FileNode) => {
    setActiveFileId(file.id)
  }

  const closeFileDialog = (
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    options?: { clearError?: boolean },
  ) => {
    setIsOpen(false)
    if (options?.clearError) {
      setFileNameError(null)
    }
  }

  const validateFileName = (
    fileName: string,
    options?: { parentFolderId: NodeId; excludeFileId?: NodeId },
  ): FileNameValidationResult => {
    const validationError = getFileNameValidationError(fileName)
    if (validationError) {
      return { ok: false, message: getFileNameValidationMessage(t, validationError) }
    }

    if (options && hasDuplicateFileName(entities, options.parentFolderId, fileName, options.excludeFileId)) {
      return { ok: false, message: t('dataroomErrorFileNameDuplicate') }
    }

    return { ok: true }
  }

  const handleFileNameDraftChange = (value: string) => {
    setFileNameDraft(value)
    setFileNameError(null)
  }

  const openRenameFileDialog = (file: FileNode) => {
    selectActiveFile(file)
    setFileNameDraft(file.name)
    setFileNameError(null)
    setIsRenameFileDialogOpen(true)
  }

  const closeRenameFileDialog = () => {
    closeFileDialog(setIsRenameFileDialogOpen, { clearError: true })
  }

  const openDeleteFileDialog = (file: FileNode) => {
    selectActiveFile(file)
    setIsDeleteFileDialogOpen(true)
  }

  const closeDeleteFileDialog = () => {
    closeFileDialog(setIsDeleteFileDialogOpen)
  }

  const openViewFileDialog = (file: FileNode) => {
    setHighlightedContentItemId(null)
    selectActiveFile(file)
    setIsViewFileDialogOpen(true)
  }

  const closeViewFileDialog = () => {
    closeFileDialog(setIsViewFileDialogOpen)
  }

  const handleUploadInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    await handleUploadFiles(selectedFiles)
    clearUploadInput(event)
  }

  const handleUploadFiles = async (selectedFiles: File[], options?: UploadFilesOptions) => {
    const uploadFolderId = options?.parentFolderId ?? activeFolder?.id ?? null
    if (!uploadFolderId) {
      return
    }

    const uploadFolder = entities.foldersById[uploadFolderId]
    if (!uploadFolder) {
      return
    }

    if (selectedFiles.length === 0) {
      return
    }

    const uploadResult = await runFileUploadPipeline({
      entities,
      uploadFolderId: uploadFolder.id,
      selectedFiles,
      callbacks: {
        createFileId: () => generateNodeId('file'),
        storeFileBlob: (fileId, file) => fileBlobStorage.putBlob(fileId, file),
        dispatchUpload: (payload) => dispatch({ type: 'dataroom/uploadFile', payload }),
      },
    })

    if (uploadResult.lastUploadedFileId) {
      setHighlightedContentItemId(uploadResult.lastUploadedFileId)
    }

    if (uploadResult.mode === 'single') {
      if (uploadResult.uploadedCount > 0) {
        enqueueFeedback(t('dataroomFeedbackFileUploaded'), 'success')
        return
      }

      if (uploadResult.singleError === 'unsupportedArchive') {
        enqueueFeedback(t('dataroomErrorArchiveUnsupported'), 'error')
        return
      }

      if (uploadResult.singleError === 'unsupportedFile') {
        enqueueFeedback(t('dataroomErrorPdfOnly'), 'error')
        return
      }

      if (uploadResult.singleError === 'archiveReadFailed') {
        enqueueFeedback(t('dataroomErrorArchiveReadFailed'), 'error')
        return
      }

      if (uploadResult.singleError === 'archiveNoPdf') {
        enqueueFeedback(t('dataroomErrorArchiveNoPdf'), 'error')
        return
      }

      if (uploadResult.singleError === 'invalidName' && uploadResult.singleInvalidNameError) {
        enqueueFeedback(getFileNameValidationMessage(t, uploadResult.singleInvalidNameError), 'error')
        return
      }

      if (uploadResult.singleError === 'duplicateName') {
        enqueueFeedback(t('dataroomErrorFileNameDuplicate'), 'error')
        return
      }

      if (uploadResult.singleError === 'storageFailed') {
        enqueueFeedback(t('dataroomErrorFileStorageFailed'), 'error')
      }
      return
    }

    if (uploadResult.uploadedCount > 0) {
      enqueueFeedback(t('dataroomFeedbackFilesUploaded', { count: uploadResult.uploadedCount }), 'success')
    }
    if (uploadResult.unsupportedFileCount > 0) {
      enqueueFeedback(t('dataroomErrorPdfOnlyBatch', { count: uploadResult.unsupportedFileCount }), 'error')
    }
    if (uploadResult.unsupportedArchiveCount > 0) {
      enqueueFeedback(t('dataroomErrorArchiveUnsupportedBatch', { count: uploadResult.unsupportedArchiveCount }), 'error')
    }
    if (uploadResult.archiveReadFailedCount > 0) {
      enqueueFeedback(t('dataroomErrorArchiveReadFailedBatch', { count: uploadResult.archiveReadFailedCount }), 'error')
    }
    if (uploadResult.archiveNoPdfCount > 0) {
      enqueueFeedback(t('dataroomErrorArchiveNoPdfBatch', { count: uploadResult.archiveNoPdfCount }), 'error')
    }
    if (uploadResult.invalidNameCount > 0) {
      enqueueFeedback(t('dataroomErrorFileNameInvalidBatch', { count: uploadResult.invalidNameCount }), 'error')
    }
    if (uploadResult.duplicateNameCount > 0) {
      enqueueFeedback(t('dataroomErrorFileNameDuplicateBatch', { count: uploadResult.duplicateNameCount }), 'error')
    }
    if (uploadResult.storageFailedCount > 0) {
      enqueueFeedback(t('dataroomErrorFileStorageFailedBatch', { count: uploadResult.storageFailedCount }), 'error')
    }

    if (
      uploadResult.uploadedCount === 0 &&
      uploadResult.unsupportedFileCount === 0 &&
      uploadResult.unsupportedArchiveCount === 0 &&
      uploadResult.archiveReadFailedCount === 0 &&
      uploadResult.archiveNoPdfCount === 0 &&
      uploadResult.invalidNameCount === 0 &&
      uploadResult.duplicateNameCount === 0 &&
      uploadResult.storageFailedCount === 0
    ) {
      enqueueFeedback(t('dataroomErrorPdfOnly'), 'error')
    }
  }

  const handleRenameFile = () => {
    if (!activeFile) {
      return
    }

    const renameValidation = validateFileName(fileNameDraft, {
      parentFolderId: activeFile.parentFolderId,
      excludeFileId: activeFile.id,
    })
    if (!renameValidation.ok) {
      setFileNameError(renameValidation.message)
      return
    }

    dispatch({
      type: 'dataroom/renameFile',
      payload: {
        fileId: activeFile.id,
        fileName: fileNameDraft,
      },
    })

    closeRenameFileDialog()
    enqueueFeedback(t('dataroomFeedbackFileRenamed'), 'success')
  }

  const handleDeleteFile = async () => {
    if (!activeFile) {
      return
    }

    const fileId = activeFile.id

    dispatch({
      type: 'dataroom/deleteFile',
      payload: {
        fileId,
      },
    })

    closeDeleteFileDialog()
    enqueueFeedback(t('dataroomFeedbackFileDeleted'), 'success')

    try {
      await fileBlobStorage.deleteBlob(fileId)
    } catch {
      // Best-effort cleanup only.
    }
  }

  return {
    handleFileNameDraftChange,
    openRenameFileDialog,
    closeRenameFileDialog,
    openDeleteFileDialog,
    closeDeleteFileDialog,
    openViewFileDialog,
    closeViewFileDialog,
    handleUploadInputChange,
    handleUploadFiles,
    handleRenameFile,
    handleDeleteFile,
  }
}
