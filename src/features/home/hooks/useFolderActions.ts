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
import { getFolderNameValidationMessage } from './nameValidationMessages'

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
  const clearTargetFolder = () => {
    setTargetFolderId(null)
  }

  const closeFolderDialog = (
    setIsOpen: Dispatch<SetStateAction<boolean>>,
    options?: { clearTarget?: boolean; clearError?: boolean },
  ) => {
    setIsOpen(false)
    if (options?.clearTarget) {
      clearTargetFolder()
    }
    if (options?.clearError) {
      setFolderNameError(null)
    }
  }

  const openFolderDialog = (setIsOpen: Dispatch<SetStateAction<boolean>>, draftName: string) => {
    setFolderNameDraft(draftName)
    setFolderNameError(null)
    setIsOpen(true)
  }

  const validateFolderName = (parentFolderId: NodeId | null, excludeFolderId?: NodeId): boolean => {
    const validationError = getFolderNameValidationError(folderNameDraft)
    if (validationError) {
      setFolderNameError(getFolderNameValidationMessage(t, validationError))
      return false
    }

    if (hasDuplicateFolderName(entities, parentFolderId, folderNameDraft, excludeFolderId)) {
      setFolderNameError(t('dataroomErrorFolderNameDuplicate'))
      return false
    }

    return true
  }

  const handleFolderNameDraftChange = (value: string) => {
    setFolderNameDraft(value)
    setFolderNameError(null)
  }

  const openCreateFolderDialog = () => {
    openFolderDialog(setIsCreateFolderDialogOpen, '')
  }

  const closeCreateFolderDialog = () => {
    closeFolderDialog(setIsCreateFolderDialogOpen)
  }

  const openRenameFolderDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    openFolderDialog(setIsRenameFolderDialogOpen, resolveDisplayName(folder.name))
  }

  const closeRenameFolderDialog = () => {
    closeFolderDialog(setIsRenameFolderDialogOpen, { clearTarget: true, clearError: true })
  }

  const openDeleteFolderDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setIsDeleteFolderDialogOpen(true)
  }

  const closeDeleteFolderDialog = () => {
    closeFolderDialog(setIsDeleteFolderDialogOpen, { clearTarget: true })
  }

  const handleCreateFolder = () => {
    if (!activeFolder || !activeDataRoom) {
      return
    }

    if (!validateFolderName(activeFolder.id)) {
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

    if (!validateFolderName(targetFolder.parentFolderId, targetFolder.id)) {
      return
    }

    dispatch({
      type: 'dataroom/renameFolder',
      payload: {
        folderId: targetFolder.id,
        folderName: folderNameDraft,
      },
    })

    closeFolderDialog(setIsRenameFolderDialogOpen, { clearTarget: true })
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

    closeFolderDialog(setIsDeleteFolderDialogOpen, { clearTarget: true })
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
