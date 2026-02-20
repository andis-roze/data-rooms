import type { Dispatch, SetStateAction } from 'react'
import {
  deleteManyFileBlobs,
  getDataRoomNameValidationError,
  getFileIdsForDataRoomDelete,
  hasDuplicateDataRoomName,
  type DataRoom,
  type DataRoomState,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'
import { getDataRoomNameValidationMessage } from './nameValidationMessages'

interface UseDataRoomActionsParams {
  t: (key: string, options?: Record<string, unknown>) => string
  entities: DataRoomState
  dispatch: Dispatch<DataRoomAction>
  activeDataRoom: DataRoom | undefined
  dataRoomNameDraft: string
  resolveDisplayName: (value: string) => string
  hasDuplicateDataRoomDisplayName: (candidateName: string, excludeDataRoomId?: NodeId) => boolean
  enqueueFeedback: (message: string, severity: 'success' | 'error') => void
  setDataRoomNameDraft: Dispatch<SetStateAction<string>>
  setDataRoomNameError: Dispatch<SetStateAction<string | null>>
  setIsCreateDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsRenameDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
  setIsDeleteDataRoomDialogOpen: Dispatch<SetStateAction<boolean>>
}

export function useDataRoomActions({
  t,
  entities,
  dispatch,
  activeDataRoom,
  dataRoomNameDraft,
  resolveDisplayName,
  hasDuplicateDataRoomDisplayName,
  enqueueFeedback,
  setDataRoomNameDraft,
  setDataRoomNameError,
  setIsCreateDataRoomDialogOpen,
  setIsRenameDataRoomDialogOpen,
  setIsDeleteDataRoomDialogOpen,
}: UseDataRoomActionsParams) {
  const selectTargetDataRoom = (targetDataRoom?: DataRoom) => {
    if (targetDataRoom && activeDataRoom?.id !== targetDataRoom.id) {
      dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId: targetDataRoom.id } })
    }
  }

  const openCreateDataRoomDialog = () => {
    setDataRoomNameDraft('')
    setDataRoomNameError(null)
    setIsCreateDataRoomDialogOpen(true)
  }

  const openRenameDataRoomDialog = (targetDataRoom?: DataRoom) => {
    const dataRoom = targetDataRoom ?? activeDataRoom
    if (!dataRoom) {
      return
    }

    selectTargetDataRoom(targetDataRoom)

    setDataRoomNameDraft(resolveDisplayName(dataRoom.name))
    setDataRoomNameError(null)
    setIsRenameDataRoomDialogOpen(true)
  }

  const openDeleteDataRoomDialog = (targetDataRoom?: DataRoom) => {
    selectTargetDataRoom(targetDataRoom)

    setIsDeleteDataRoomDialogOpen(true)
  }

  const closeCreateDataRoomDialog = () => {
    setIsCreateDataRoomDialogOpen(false)
  }

  const closeRenameDataRoomDialog = () => {
    setIsRenameDataRoomDialogOpen(false)
  }

  const closeDeleteDataRoomDialog = () => {
    setIsDeleteDataRoomDialogOpen(false)
  }

  const handleDataRoomNameDraftChange = (value: string) => {
    setDataRoomNameDraft(value)
    setDataRoomNameError(null)
  }

  const handleCreateDataRoom = () => {
    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(getDataRoomNameValidationMessage(t, validationError))
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

    setIsCreateDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomCreated'), 'success')
  }

  const handleRenameDataRoom = () => {
    if (!activeDataRoom) {
      return
    }

    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(getDataRoomNameValidationMessage(t, validationError))
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

    setIsRenameDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomRenamed'), 'success')
  }

  const handleDeleteDataRoom = async () => {
    if (!activeDataRoom) {
      return
    }

    const fileIdsToDelete = getFileIdsForDataRoomDelete(entities, activeDataRoom.id)

    dispatch({
      type: 'dataroom/deleteDataRoom',
      payload: { dataRoomId: activeDataRoom.id },
    })

    setIsDeleteDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomDeleted'), 'success')

    try {
      await deleteManyFileBlobs(fileIdsToDelete)
    } catch {
      // Best-effort cleanup only.
    }
  }

  return {
    openCreateDataRoomDialog,
    openRenameDataRoomDialog,
    openDeleteDataRoomDialog,
    closeCreateDataRoomDialog,
    closeRenameDataRoomDialog,
    closeDeleteDataRoomDialog,
    handleDataRoomNameDraftChange,
    handleCreateDataRoom,
    handleRenameDataRoom,
    handleDeleteDataRoom,
  }
}
