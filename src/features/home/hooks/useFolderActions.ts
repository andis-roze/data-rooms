import type { Dispatch, SetStateAction } from 'react'
import {
  deleteManyFileBlobs,
  getFileIdsForFolderCascadeDelete,
  getFolderNameValidationError,
  hasDuplicateFolderName,
  type DataRoom,
  type DataRoomState,
  type Folder,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'

interface UseFolderActionsParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeDataRoom: DataRoom | undefined
  activeFolder: Folder | null
  targetFolder: Folder | null
  folderNameDraft: string
  resolveDisplayName: (value: string) => string
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setFolderNameDraft: Dispatch<SetStateAction<string>>
  setFolderNameError: Dispatch<SetStateAction<string | null>>
  setTargetFolderId: Dispatch<SetStateAction<NodeId | null>>
  setIsCreateFolderDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsRenameFolderDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsDeleteFolderDialogOpen: Dispatch<SetStateAction<boolean>>
}

export function useFolderActions({
  t,
  entities,
  dispatch,
  activeDataRoom,
  activeFolder,
  targetFolder,
  folderNameDraft,
  resolveDisplayName,
  enqueueFeedback,
  setFolderNameDraft,
  setFolderNameError,
  setTargetFolderId,
  setIsCreateFolderDialogOpen,
  setIsRenameFolderDialogOpen,
  setIsDeleteFolderDialogOpen,
}: UseFolderActionsParams) {
  const handleFolderNameDraftChange = (value: string) => {
    setFolderNameDraft(value)
    setFolderNameError(null)
  }

  const openCreateFolderDialog = () => {
    setFolderNameDraft('')
    setFolderNameError(null)
    setIsCreateFolderDialogOpen(true)
  }

  const closeCreateFolderDialog = () => {
    setIsCreateFolderDialogOpen(false)
  }

  const openRenameFolderDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setFolderNameDraft(resolveDisplayName(folder.name))
    setFolderNameError(null)
    setIsRenameFolderDialogOpen(true)
  }

  const closeRenameFolderDialog = () => {
    setIsRenameFolderDialogOpen(false)
    setTargetFolderId(null)
    setFolderNameError(null)
  }

  const openDeleteFolderDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setIsDeleteFolderDialogOpen(true)
  }

  const closeDeleteFolderDialog = () => {
    setIsDeleteFolderDialogOpen(false)
    setTargetFolderId(null)
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

    setIsCreateFolderDialogOpen(false)
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

    setIsRenameFolderDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderRenamed'), 'success')
  }

  const handleDeleteFolder = async () => {
    if (!targetFolder) {
      return
    }

    const fileIdsToDelete = getFileIdsForFolderCascadeDelete(entities, targetFolder.id)

    dispatch({
      type: 'dataroom/deleteFolder',
      payload: { folderId: targetFolder.id },
    })

    setIsDeleteFolderDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderDeleted'), 'success')

    try {
      await deleteManyFileBlobs(fileIdsToDelete)
    } catch {
      // Best-effort cleanup only.
    }
  }

  return {
    handleFolderNameDraftChange,
    openCreateFolderDialog,
    closeCreateFolderDialog,
    openRenameFolderDialog,
    closeRenameFolderDialog,
    openDeleteFolderDialog,
    closeDeleteFolderDialog,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
  }
}
