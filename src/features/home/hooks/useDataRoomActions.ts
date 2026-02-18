import {
  getDataRoomNameValidationError,
  hasDuplicateDataRoomName,
} from '../../dataroom/model'
import type { HomeActionCommonParams } from './actionParams'
import { generateNodeId } from '../services/id'

type Params = Pick<
  HomeActionCommonParams,
  | 't'
  | 'entities'
  | 'dispatch'
  | 'activeDataRoom'
  | 'dataRoomNameDraft'
  | 'resolveDisplayName'
  | 'hasDuplicateDataRoomDisplayName'
  | 'enqueueFeedback'
  | 'setCreateDataRoomDialogOpen'
  | 'setRenameDataRoomDialogOpen'
  | 'setDeleteDataRoomDialogOpen'
  | 'setDataRoomNameDraft'
  | 'setDataRoomNameError'
>

export function useDataRoomActions({
  t,
  entities,
  dispatch,
  activeDataRoom,
  dataRoomNameDraft,
  resolveDisplayName,
  hasDuplicateDataRoomDisplayName,
  enqueueFeedback,
  setCreateDataRoomDialogOpen,
  setRenameDataRoomDialogOpen,
  setDeleteDataRoomDialogOpen,
  setDataRoomNameDraft,
  setDataRoomNameError,
}: Params) {
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

  return {
    openCreateDataRoomDialog,
    openRenameDataRoomDialog,
    handleCreateDataRoom,
    handleRenameDataRoom,
    handleDeleteDataRoom,
  }
}
