import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import type { TFunction } from 'i18next'
import {
  getDataRoomNameValidationError,
  getFileNameValidationError,
  getFolderNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateDataRoomName,
  hasDuplicateFileName,
  hasDuplicateFolderName,
  preparePdfUpload,
  type DataRoom,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../dataroom/model'
import type { DataRoomAction } from '../dataroom/state/types'
import type { SortField, SortState } from './types'
import { generateNodeId, saveSortModePreference } from './utils'

interface UseHomePageHandlersParams {
  t: TFunction
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeDataRoom: DataRoom | undefined
  activeFolder: Folder | null
  targetFolder: Folder | null
  activeFile: FileNode | null
  dataRoomNameDraft: string
  folderNameDraft: string
  fileNameDraft: string
  sortState: SortState
  resolveDisplayName: (value: string) => string
  hasDuplicateDataRoomDisplayName: (candidateName: string, excludeDataRoomId?: NodeId) => boolean
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setSortState: Dispatch<SetStateAction<SortState>>
  setCreateDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setCreateDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>
  setRenameFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setDeleteFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setViewFileDialogOpen: Dispatch<SetStateAction<boolean>>
  setTargetFolderId: Dispatch<SetStateAction<NodeId | null>>
  setActiveFileId: Dispatch<SetStateAction<NodeId | null>>
  setFolderNameDraft: Dispatch<SetStateAction<string>>
  setFolderNameError: Dispatch<SetStateAction<string | null>>
  setDataRoomNameDraft: Dispatch<SetStateAction<string>>
  setDataRoomNameError: Dispatch<SetStateAction<string | null>>
  setFileNameDraft: Dispatch<SetStateAction<string>>
  setFileNameError: Dispatch<SetStateAction<string | null>>
}

export function useHomePageHandlers({
  t,
  entities,
  dispatch,
  activeDataRoom,
  activeFolder,
  targetFolder,
  activeFile,
  dataRoomNameDraft,
  folderNameDraft,
  fileNameDraft,
  sortState,
  resolveDisplayName,
  hasDuplicateDataRoomDisplayName,
  enqueueFeedback,
  setSortState,
  setCreateDataRoomDialogOpen,
  setRenameDataRoomDialogOpen,
  setDeleteDataRoomDialogOpen,
  setCreateDialogOpen,
  setRenameDialogOpen,
  setDeleteDialogOpen,
  setRenameFileDialogOpen,
  setDeleteFileDialogOpen,
  setViewFileDialogOpen,
  setTargetFolderId,
  setActiveFileId,
  setFolderNameDraft,
  setFolderNameError,
  setDataRoomNameDraft,
  setDataRoomNameError,
  setFileNameDraft,
  setFileNameError,
}: UseHomePageHandlersParams) {
  const openCreateDataRoomDialog = () => {
    setDataRoomNameDraft('')
    setDataRoomNameError(null)
    setCreateDataRoomDialogOpen(true)
  }

  const openRenameDataRoomDialog = () => {
    if (!activeDataRoom) {
      return
    }

    setDataRoomNameDraft(resolveDisplayName(activeDataRoom.name))
    setDataRoomNameError(null)
    setRenameDataRoomDialogOpen(true)
  }

  const handleCreateDataRoom = () => {
    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(
        validationError === 'empty' ? t('dataroomErrorDataRoomNameEmpty') : t('dataroomErrorDataRoomNameReserved'),
      )
      return
    }

    if (hasDuplicateDataRoomDisplayName(dataRoomNameDraft) || hasDuplicateDataRoomName(entities, dataRoomNameDraft)) {
      setDataRoomNameError(t('dataroomErrorDataRoomNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/createDataRoom',
      payload: {
        dataRoomId: generateNodeId('dataroom'),
        rootFolderId: generateNodeId('folder'),
        dataRoomName: dataRoomNameDraft,
        rootFolderName: t('dataroomSeedDefaultRootFolderName'),
      },
    })

    setCreateDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomCreated'), 'success')
  }

  const handleRenameDataRoom = () => {
    if (!activeDataRoom) {
      return
    }

    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(
        validationError === 'empty' ? t('dataroomErrorDataRoomNameEmpty') : t('dataroomErrorDataRoomNameReserved'),
      )
      return
    }

    if (
      hasDuplicateDataRoomDisplayName(dataRoomNameDraft, activeDataRoom.id) ||
      hasDuplicateDataRoomName(entities, dataRoomNameDraft, activeDataRoom.id)
    ) {
      setDataRoomNameError(t('dataroomErrorDataRoomNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameDataRoom',
      payload: {
        dataRoomId: activeDataRoom.id,
        dataRoomName: dataRoomNameDraft,
      },
    })

    setRenameDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomRenamed'), 'success')
  }

  const handleDeleteDataRoom = () => {
    if (!activeDataRoom) {
      return
    }

    dispatch({
      type: 'dataroom/deleteDataRoom',
      payload: { dataRoomId: activeDataRoom.id },
    })

    setDeleteDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomDeleted'), 'success')
  }

  const openCreateDialog = () => {
    setFolderNameDraft('')
    setFolderNameError(null)
    setCreateDialogOpen(true)
  }

  const openRenameDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setFolderNameDraft(resolveDisplayName(folder.name))
    setFolderNameError(null)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setDeleteDialogOpen(true)
  }

  const closeRenameDialog = () => {
    setRenameDialogOpen(false)
    setTargetFolderId(null)
    setFolderNameError(null)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setTargetFolderId(null)
  }

  const openRenameFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setFileNameDraft(file.name)
    setFileNameError(null)
    setRenameFileDialogOpen(true)
  }

  const openDeleteFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setDeleteFileDialogOpen(true)
  }

  const openViewFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setViewFileDialogOpen(true)
  }

  const handleCreateFolder = () => {
    if (!activeFolder || !activeDataRoom) {
      return
    }

    const validationError = getFolderNameValidationError(folderNameDraft)

    if (validationError) {
      setFolderNameError(
        validationError === 'empty' ? t('dataroomErrorFolderNameEmpty') : t('dataroomErrorFolderNameReserved'),
      )
      return
    }

    if (hasDuplicateFolderName(entities, activeFolder.id, folderNameDraft)) {
      setFolderNameError(t('dataroomErrorFolderNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/createFolder',
      payload: {
        dataRoomId: activeDataRoom.id,
        parentFolderId: activeFolder.id,
        folderId: generateNodeId('folder'),
        folderName: folderNameDraft,
      },
    })

    setCreateDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFolderCreated'), 'success')
  }

  const handleRenameFolder = () => {
    if (!targetFolder) {
      return
    }

    const validationError = getFolderNameValidationError(folderNameDraft)

    if (validationError) {
      setFolderNameError(
        validationError === 'empty' ? t('dataroomErrorFolderNameEmpty') : t('dataroomErrorFolderNameReserved'),
      )
      return
    }

    if (hasDuplicateFolderName(entities, targetFolder.parentFolderId, folderNameDraft, targetFolder.id)) {
      setFolderNameError(t('dataroomErrorFolderNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameFolder',
      payload: {
        folderId: targetFolder.id,
        folderName: folderNameDraft,
      },
    })

    setRenameDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderRenamed'), 'success')
  }

  const handleDeleteFolder = () => {
    if (!targetFolder) {
      return
    }

    dispatch({
      type: 'dataroom/deleteFolder',
      payload: { folderId: targetFolder.id },
    })

    setDeleteDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderDeleted'), 'success')
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

  const toggleSort = (field: SortField) => {
    const nextState: SortState =
      sortState.field === field
        ? { field, direction: sortState.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }

    setSortState(nextState)
    saveSortModePreference(nextState)
  }

  return {
    openCreateDataRoomDialog,
    openRenameDataRoomDialog,
    handleCreateDataRoom,
    handleRenameDataRoom,
    handleDeleteDataRoom,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeRenameDialog,
    closeDeleteDialog,
    openRenameFileDialog,
    openDeleteFileDialog,
    openViewFileDialog,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleUploadInputChange,
    handleRenameFile,
    handleDeleteFile,
    toggleSort,
  }
}
