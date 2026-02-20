import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import {
  getFileNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateFileName,
  preparePdfUpload,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'
import type { FileBlobStorageService } from '../services/fileBlobStorage'
import { getFileNameValidationMessage } from './nameValidationMessages'

interface UseFileActionsParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeFolder: Folder | null
  activeFile: FileNode | null
  fileNameDraft: string
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  fileBlobStorage: FileBlobStorageService
  setActiveFileId: Dispatch<SetStateAction<NodeId | null>>
  setFileNameDraft: Dispatch<SetStateAction<string>>
  setFileNameError: Dispatch<SetStateAction<string | null>>
  setIsRenameFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsDeleteFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsViewFileDialogOpen: Dispatch<SetStateAction<boolean>>
}

type FileNameValidationResult = { ok: true } | { ok: false; message: string }

export function useFileActions({
  t,
  entities,
  dispatch,
  activeFolder,
  activeFile,
  fileNameDraft,
  enqueueFeedback,
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
    selectActiveFile(file)
    setIsViewFileDialogOpen(true)
  }

  const closeViewFileDialog = () => {
    closeFileDialog(setIsViewFileDialogOpen)
  }

  const handleUploadInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activeFolder) {
      return
    }

    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    const uploadError = getPdfUploadValidationError(selectedFile)

    if (uploadError) {
      enqueueFeedback(t('dataroomErrorPdfOnly'), 'error')
      clearUploadInput(event)
      return
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const uploadNameValidation = validateFileName(preparedUpload.fileName, { parentFolderId: activeFolder.id })
    if (!uploadNameValidation.ok) {
      enqueueFeedback(uploadNameValidation.message, 'error')
      clearUploadInput(event)
      return
    }

    const fileId = generateNodeId('file')

    try {
      await fileBlobStorage.putBlob(fileId, selectedFile)
    } catch {
      enqueueFeedback(t('dataroomErrorFileStorageFailed'), 'error')
      clearUploadInput(event)
      return
    }

    dispatch({
      type: 'dataroom/uploadFile',
      payload: {
        parentFolderId: activeFolder.id,
        fileId,
        fileName: preparedUpload.fileName,
        size: preparedUpload.size,
        mimeType: preparedUpload.mimeType,
      },
    })

    enqueueFeedback(t('dataroomFeedbackFileUploaded'), 'success')
    clearUploadInput(event)
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
    handleRenameFile,
    handleDeleteFile,
  }
}
