import {
  createDataRoom,
  createFile,
  createFolder,
  createSeedDataRoomState,
  deleteDataRoom,
  deleteFile,
  deleteFolderCascade,
  getDefaultSelection,
  hasDataRoom,
  hasFolder,
  renameDataRoom,
  renameFile,
  renameFolder,
  resolveSelection,
  type DataRoomState,
} from '../model'
import type { DataRoomAction, DataRoomStoreState } from './types'

export function createInitialDataRoomStoreState(entities: DataRoomState): DataRoomStoreState {
  const selection = getDefaultSelection(entities)

  return {
    entities,
    selectedDataRoomId: selection.selectedDataRoomId,
    selectedFolderId: selection.selectedFolderId,
  }
}

export function dataRoomReducer(state: DataRoomStoreState, action: DataRoomAction): DataRoomStoreState {
  switch (action.type) {
    case 'dataroom/rehydrate': {
      const selection = resolveSelection(
        action.payload,
        state.selectedDataRoomId,
        state.selectedFolderId,
      )

      return {
        entities: action.payload,
        selectedDataRoomId: selection.selectedDataRoomId,
        selectedFolderId: selection.selectedFolderId,
      }
    }

    case 'dataroom/reset': {
      const entities = createSeedDataRoomState(action.payload?.now)
      return createInitialDataRoomStoreState(entities)
    }

    case 'dataroom/selectDataRoom': {
      const { dataRoomId } = action.payload

      if (!hasDataRoom(state.entities, dataRoomId)) {
        return state
      }

      const selection = resolveSelection(state.entities, dataRoomId, null)

      return {
        ...state,
        selectedDataRoomId: selection.selectedDataRoomId,
        selectedFolderId: selection.selectedFolderId,
      }
    }

    case 'dataroom/selectFolder': {
      const { folderId } = action.payload

      if (!hasFolder(state.entities, folderId)) {
        return state
      }

      const folder = state.entities.foldersById[folderId]
      const selection = resolveSelection(state.entities, folder.dataRoomId, folderId)

      return {
        ...state,
        selectedDataRoomId: selection.selectedDataRoomId,
        selectedFolderId: selection.selectedFolderId,
      }
    }

    case 'dataroom/createDataRoom': {
      const entities = createDataRoom(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
        selectedDataRoomId: action.payload.dataRoomId,
        selectedFolderId: action.payload.rootFolderId,
      }
    }

    case 'dataroom/renameDataRoom': {
      const entities = renameDataRoom(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
      }
    }

    case 'dataroom/deleteDataRoom': {
      const result = deleteDataRoom(state.entities, action.payload)

      if (!result.deleted) {
        return state
      }

      const selection = resolveSelection(result.nextState, result.fallbackDataRoomId, null)

      return {
        ...state,
        entities: result.nextState,
        selectedDataRoomId: selection.selectedDataRoomId,
        selectedFolderId: selection.selectedFolderId,
      }
    }

    case 'dataroom/createFolder': {
      const entities = createFolder(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
        selectedDataRoomId: action.payload.dataRoomId,
        selectedFolderId: action.payload.folderId,
      }
    }

    case 'dataroom/renameFolder': {
      const entities = renameFolder(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
      }
    }

    case 'dataroom/deleteFolder': {
      const result = deleteFolderCascade(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (!result.deleted) {
        return state
      }

      const selection = resolveSelection(
        result.nextState,
        state.selectedDataRoomId,
        result.fallbackFolderId ?? state.selectedFolderId,
      )

      return {
        ...state,
        entities: result.nextState,
        selectedDataRoomId: selection.selectedDataRoomId,
        selectedFolderId: selection.selectedFolderId,
      }
    }

    case 'dataroom/uploadFile': {
      const entities = createFile(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
      }
    }

    case 'dataroom/renameFile': {
      const entities = renameFile(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
      }
    }

    case 'dataroom/deleteFile': {
      const entities = deleteFile(state.entities, {
        ...action.payload,
        now: Date.now(),
      })

      if (entities === state.entities) {
        return state
      }

      return {
        ...state,
        entities,
      }
    }

    default:
      return state
  }
}
