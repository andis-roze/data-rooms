import type { DataRoomState, NodeId, UnixMs } from '../types'
import type { DeleteDataRoomResult, DeleteFolderCascadeResult } from './types'

export function createDeleteDataRoomNoopResult(state: DataRoomState): DeleteDataRoomResult {
  return {
    nextState: state,
    deleted: false,
    fallbackDataRoomId: null,
  }
}

export function createDeleteFolderCascadeNoopResult(state: DataRoomState): DeleteFolderCascadeResult {
  return {
    nextState: state,
    deleted: false,
    fallbackFolderId: null,
    deletedFolderCount: 0,
    deletedFileCount: 0,
  }
}

export function withUpdatedDataRoomTimestamp(
  state: DataRoomState,
  dataRoomId: NodeId,
  now: UnixMs,
): DataRoomState['dataRoomsById'] {
  return {
    ...state.dataRoomsById,
    [dataRoomId]: {
      ...state.dataRoomsById[dataRoomId],
      updatedAt: now,
    },
  }
}

export function omitFoldersById(
  source: DataRoomState['foldersById'],
  folderIds: Iterable<NodeId>,
): DataRoomState['foldersById'] {
  const nextFoldersById = { ...source }
  for (const id of folderIds) {
    delete nextFoldersById[id]
  }
  return nextFoldersById
}

export function omitFilesById(source: DataRoomState['filesById'], fileIds: Iterable<NodeId>): DataRoomState['filesById'] {
  const nextFilesById = { ...source }
  for (const id of fileIds) {
    delete nextFilesById[id]
  }
  return nextFilesById
}

export function isDescendantFolder(state: DataRoomState, folderId: NodeId, possibleAncestorId: NodeId): boolean {
  let currentFolderId: NodeId | null = folderId
  while (currentFolderId) {
    if (currentFolderId === possibleAncestorId) {
      return true
    }
    currentFolderId = state.foldersById[currentFolderId]?.parentFolderId ?? null
  }
  return false
}
