import type { DataRoomState, NodeId } from './types'

// Selection guards/fallbacks used by reducer after structural mutations.
export interface DataRoomSelection {
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
}

export function getDefaultSelection(state: DataRoomState): DataRoomSelection {
  const selectedDataRoomId = state.dataRoomOrder[0] ?? null

  if (!selectedDataRoomId) {
    return {
      selectedDataRoomId: null,
      selectedFolderId: null,
    }
  }

  const dataRoom = state.dataRoomsById[selectedDataRoomId]

  if (!dataRoom) {
    return {
      selectedDataRoomId: null,
      selectedFolderId: null,
    }
  }

  return {
    selectedDataRoomId,
    selectedFolderId: dataRoom.rootFolderId,
  }
}

export function hasDataRoom(state: DataRoomState, dataRoomId: NodeId): boolean {
  return Boolean(state.dataRoomsById[dataRoomId])
}

export function hasFolder(state: DataRoomState, folderId: NodeId): boolean {
  return Boolean(state.foldersById[folderId])
}

export function resolveSelection(
  state: DataRoomState,
  selectedDataRoomId: NodeId | null,
  selectedFolderId: NodeId | null,
): DataRoomSelection {
  if (!selectedDataRoomId || !hasDataRoom(state, selectedDataRoomId)) {
    return getDefaultSelection(state)
  }

  const dataRoom = state.dataRoomsById[selectedDataRoomId]

  if (!selectedFolderId || !hasFolder(state, selectedFolderId)) {
    return {
      selectedDataRoomId,
      selectedFolderId: dataRoom.rootFolderId,
    }
  }

  const selectedFolder = state.foldersById[selectedFolderId]

  if (selectedFolder.dataRoomId !== selectedDataRoomId) {
    return {
      selectedDataRoomId,
      selectedFolderId: dataRoom.rootFolderId,
    }
  }

  return {
    selectedDataRoomId,
    selectedFolderId,
  }
}
