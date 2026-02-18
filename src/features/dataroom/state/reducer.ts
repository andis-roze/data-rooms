import {
  createSeedDataRoomState,
  getDefaultSelection,
  hasDataRoom,
  hasFolder,
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

    default:
      return state
  }
}
