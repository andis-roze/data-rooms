import {
  getDataRoomNameValidationError,
  getFolderNameValidationError,
  hasDuplicateDataRoomName,
  normalizeNodeName,
} from '../nameValidation'
import { collectFolderAndFileIds } from '../treeDeleteTargets'
import type { DataRoomState } from '../types'
import { createDeleteDataRoomNoopResult, omitFilesById, omitFoldersById } from './shared'
import type {
  CreateDataRoomInput,
  DeleteDataRoomInput,
  DeleteDataRoomResult,
  RenameDataRoomInput,
} from './types'

export function createDataRoom(state: DataRoomState, input: CreateDataRoomInput): DataRoomState {
  const { dataRoomId, rootFolderId, dataRoomName, rootFolderName, now } = input
  const dataRoomNameError = getDataRoomNameValidationError(dataRoomName)
  const rootFolderNameError = getFolderNameValidationError(rootFolderName)

  if (dataRoomNameError || rootFolderNameError) {
    return state
  }

  if (hasDuplicateDataRoomName(state, dataRoomName)) {
    return state
  }

  if (state.dataRoomsById[dataRoomId] || state.foldersById[rootFolderId]) {
    return state
  }

  return {
    ...state,
    dataRoomOrder: [...state.dataRoomOrder, dataRoomId],
    dataRoomsById: {
      ...state.dataRoomsById,
      [dataRoomId]: {
        id: dataRoomId,
        name: dataRoomName.trim(),
        rootFolderId,
        createdAt: now,
        updatedAt: now,
      },
    },
    foldersById: {
      ...state.foldersById,
      [rootFolderId]: {
        id: rootFolderId,
        dataRoomId,
        parentFolderId: null,
        name: rootFolderName.trim(),
        childFolderIds: [],
        fileIds: [],
        createdAt: now,
        updatedAt: now,
      },
    },
  }
}

export function renameDataRoom(state: DataRoomState, input: RenameDataRoomInput): DataRoomState {
  const { dataRoomId, dataRoomName, now } = input
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return state
  }

  const dataRoomNameError = getDataRoomNameValidationError(dataRoomName)
  const nextName = dataRoomName.trim()

  if (dataRoomNameError || normalizeNodeName(nextName) === normalizeNodeName(dataRoom.name)) {
    return state
  }

  if (hasDuplicateDataRoomName(state, nextName, dataRoomId)) {
    return state
  }

  return {
    ...state,
    dataRoomsById: {
      ...state.dataRoomsById,
      [dataRoomId]: {
        ...dataRoom,
        name: nextName,
        updatedAt: now,
      },
    },
  }
}

export function deleteDataRoom(state: DataRoomState, input: DeleteDataRoomInput): DeleteDataRoomResult {
  const { dataRoomId } = input
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return createDeleteDataRoomNoopResult(state)
  }

  const collectResult = collectFolderAndFileIds(state, dataRoom.rootFolderId)
  const nextDataRoomsById = { ...state.dataRoomsById }
  const nextFoldersById = omitFoldersById(state.foldersById, collectResult.folderIds)
  const nextFilesById = omitFilesById(state.filesById, collectResult.fileIds)

  delete nextDataRoomsById[dataRoomId]

  const nextDataRoomOrder = state.dataRoomOrder.filter((id) => id !== dataRoomId)

  return {
    nextState: {
      ...state,
      dataRoomOrder: nextDataRoomOrder,
      dataRoomsById: nextDataRoomsById,
      foldersById: nextFoldersById,
      filesById: nextFilesById,
    },
    deleted: true,
    fallbackDataRoomId: nextDataRoomOrder[0] ?? null,
  }
}
