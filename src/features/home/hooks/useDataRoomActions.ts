import type { Dispatch, SetStateAction } from 'react'
import {
  getDataRoomNameValidationError,
  hasDuplicateDataRoomName,
  type DataRoom,
  type DataRoomState,
  type NodeId,
} from '../../dataroom/model'
import type { DataRoomAction } from '../../dataroom/state/types'
import { generateNodeId } from '../services/id'

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
  const openCreateDataRoomDialog = () => {
    setDataRoomNameDraft('')
    setDataRoomNameError(null)
    setIsCreateDataRoomDialogOpen(true)
  }

  const openRenameDataRoomDialog = () => {
    if (!activeDataRoom) {
      return
    }

    setDataRoomNameDraft(resolveDisplayName(activeDataRoom.name))
    setDataRoomNameError(null)
    setIsRenameDataRoomDialogOpen(true)
  }

  const openDeleteDataRoomDialog = () => {
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

    setIsCreateDataRoomDialogOpen(false)
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

    setIsRenameDataRoomDialogOpen(false)
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

    setIsDeleteDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomDeleted'), 'success')
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
