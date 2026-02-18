import {
  getFolderNameValidationError,
  hasDuplicateFolderName,
} from '../../dataroom/model'
import type { HomeActionCommonParams } from './actionParams'
import { generateNodeId } from '../services/id'

type Params = Pick<
  HomeActionCommonParams,
  | 't'
  | 'entities'
  | 'dispatch'
  | 'activeDataRoom'
  | 'activeFolder'
  | 'targetFolder'
  | 'folderNameDraft'
  | 'enqueueFeedback'
  | 'setCreateDialogOpen'
  | 'setRenameDialogOpen'
  | 'setDeleteDialogOpen'
  | 'setTargetFolderId'
  | 'setFolderNameDraft'
  | 'setFolderNameError'
  | 'resolveDisplayName'
>

export function useFolderActions({
  t,
  entities,
  dispatch,
  activeDataRoom,
  activeFolder,
  targetFolder,
  folderNameDraft,
  enqueueFeedback,
  setCreateDialogOpen,
  setRenameDialogOpen,
  setDeleteDialogOpen,
  setTargetFolderId,
  setFolderNameDraft,
  setFolderNameError,
  resolveDisplayName,
}: Params) {
  const openCreateDialog = () => {
    setFolderNameDraft('')
    setFolderNameError(null)
    setCreateDialogOpen(true)
  }

  const openRenameDialog = (folder: { id: string; name: string }) => {
    setTargetFolderId(folder.id)
    setFolderNameDraft(resolveDisplayName(folder.name))
    setFolderNameError(null)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (folder: { id: string }) => {
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

  return {
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeRenameDialog,
    closeDeleteDialog,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
  }
}
