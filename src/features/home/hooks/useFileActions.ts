import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import {
  deleteFileBlob,
  getFileNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateFileName,
  preparePdfUpload,
  putFileBlob,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'
import { getFileNameValidationMessage } from './nameValidationMessages'

interface UseFileActionsParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeFolder: Folder | null
  activeFile: FileNode | null
  fileNameDraft: string
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setActiveFileId: Dispatch<SetStateAction<NodeId | null>>
  setFileNameDraft: Dispatch<SetStateAction<string>>
  setFileNameError: Dispatch<SetStateAction<string | null>>
  setIsRenameFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsDeleteFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsViewFileDialogOpen: Dispatch<SetStateAction<boolean>>
}

export function useFileActions({
  t,
  entities,
  dispatch,
  activeFolder,
  activeFile,
  fileNameDraft,
  enqueueFeedback,
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
    setIsRenameFileDialogOpen(false)
  }

  const openDeleteFileDialog = (file: FileNode) => {
    selectActiveFile(file)
    setIsDeleteFileDialogOpen(true)
  }

  const closeDeleteFileDialog = () => {
    setIsDeleteFileDialogOpen(false)
  }

  const openViewFileDialog = (file: FileNode) => {
    selectActiveFile(file)
    setIsViewFileDialogOpen(true)
  }

  const closeViewFileDialog = () => {
    setIsViewFileDialogOpen(false)
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
      enqueueFeedback(uploadError === 'invalidPdf' ? t('dataroomErrorPdfOnly') : t('dataroomErrorPdfOnly'), 'error')
      clearUploadInput(event)
      return
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const nameError = getFileNameValidationError(preparedUpload.fileName)

    if (nameError) {
      enqueueFeedback(getFileNameValidationMessage(t, nameError), 'error')
      clearUploadInput(event)
      return
    }

    if (hasDuplicateFileName(entities, activeFolder.id, preparedUpload.fileName)) {
      enqueueFeedback(t('dataroomErrorFileNameDuplicate'), 'error')
      clearUploadInput(event)
      return
    }

    const fileId = generateNodeId('file')

    try {
      await putFileBlob(fileId, selectedFile)
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

    const validationError = getFileNameValidationError(fileNameDraft)

    if (validationError) {
      setFileNameError(getFileNameValidationMessage(t, validationError))
      return
    }

    if (hasDuplicateFileName(entities, activeFile.parentFolderId, fileNameDraft, activeFile.id)) {
      setFileNameError(t('dataroomErrorFileNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameFile',
      payload: {
        fileId: activeFile.id,
        fileName: fileNameDraft,
      },
    })

    setIsRenameFileDialogOpen(false)
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

    setIsDeleteFileDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFileDeleted'), 'success')

    try {
      await deleteFileBlob(fileId)
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
