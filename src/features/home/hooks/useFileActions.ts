import type { ChangeEvent } from 'react'
import {
  getFileNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateFileName,
  preparePdfUpload,
} from '../../dataroom/model'
import type { HomeActionCommonParams } from './actionParams'
import { generateNodeId } from '../services/id'

type Params = Pick<
  HomeActionCommonParams,
  | 't'
  | 'entities'
  | 'dispatch'
  | 'activeFolder'
  | 'activeFile'
  | 'fileNameDraft'
  | 'enqueueFeedback'
  | 'setRenameFileDialogOpen'
  | 'setDeleteFileDialogOpen'
  | 'setViewFileDialogOpen'
  | 'setActiveFileId'
  | 'setFileNameDraft'
  | 'setFileNameError'
>

export function useFileActions({
  t,
  entities,
  dispatch,
  activeFolder,
  activeFile,
  fileNameDraft,
  enqueueFeedback,
  setRenameFileDialogOpen,
  setDeleteFileDialogOpen,
  setViewFileDialogOpen,
  setActiveFileId,
  setFileNameDraft,
  setFileNameError,
}: Params) {
  const openRenameFileDialog = (file: { id: string; name: string }) => {
    setActiveFileId(file.id)
    setFileNameDraft(file.name)
    setFileNameError(null)
    setRenameFileDialogOpen(true)
  }

  const openDeleteFileDialog = (file: { id: string }) => {
    setActiveFileId(file.id)
    setDeleteFileDialogOpen(true)
  }

  const openViewFileDialog = (file: { id: string }) => {
    setActiveFileId(file.id)
    setViewFileDialogOpen(true)
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

    setRenameFileDialogOpen(false)
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

    setDeleteFileDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFileDeleted'), 'success')
  }

  return {
    openRenameFileDialog,
    openDeleteFileDialog,
    openViewFileDialog,
    handleUploadInputChange,
    handleRenameFile,
    handleDeleteFile,
  }
}
