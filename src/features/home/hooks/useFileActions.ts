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
  const handleFileNameDraftChange = (value: string) => {
    setFileNameDraft(value)
    setFileNameError(null)
  }

  const openRenameFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setFileNameDraft(file.name)
    setFileNameError(null)
    setIsRenameFileDialogOpen(true)
  }

  const closeRenameFileDialog = () => {
    setIsRenameFileDialogOpen(false)
  }

  const openDeleteFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setIsDeleteFileDialogOpen(true)
  }

  const closeDeleteFileDialog = () => {
    setIsDeleteFileDialogOpen(false)
  }

  const openViewFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setIsViewFileDialogOpen(true)
  }

  const closeViewFileDialog = () => {
    setIsViewFileDialogOpen(false)
  }

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      event.target.value = ''
      return
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const nameError = getFileNameValidationError(preparedUpload.fileName)

    if (nameError) {
      enqueueFeedback(nameError === 'empty' ? t('dataroomErrorFileNameEmpty') : t('dataroomErrorFileNameReserved'), 'error')
      event.target.value = ''
      return
    }

    if (hasDuplicateFileName(entities, activeFolder.id, preparedUpload.fileName)) {
      enqueueFeedback(t('dataroomErrorFileNameDuplicate'), 'error')
      event.target.value = ''
      return
    }

    dispatch({
      type: 'dataroom/uploadFile',
      payload: {
        parentFolderId: activeFolder.id,
        fileId: generateNodeId('file'),
        fileName: preparedUpload.fileName,
        size: preparedUpload.size,
        mimeType: preparedUpload.mimeType,
        objectUrl: preparedUpload.objectUrl,
      },
    })

    enqueueFeedback(t('dataroomFeedbackFileUploaded'), 'success')
    event.target.value = ''
  }

  const handleRenameFile = () => {
    if (!activeFile) {
      return
    }

    const validationError = getFileNameValidationError(fileNameDraft)

    if (validationError) {
      setFileNameError(
        validationError === 'empty' ? t('dataroomErrorFileNameEmpty') : t('dataroomErrorFileNameReserved'),
      )
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

  const handleDeleteFile = () => {
    if (!activeFile) {
      return
    }

    dispatch({
      type: 'dataroom/deleteFile',
      payload: {
        fileId: activeFile.id,
      },
    })

    setIsDeleteFileDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFileDeleted'), 'success')
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
