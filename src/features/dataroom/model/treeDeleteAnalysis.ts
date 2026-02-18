import { collectFolderAndFileIds } from './treeDeleteTargets'
import type { DataRoomState, NodeId } from './types'

export interface FolderDeleteSummary {
  folderCount: number
  fileCount: number
}

export interface DataRoomDeleteSummary {
  folderCount: number
  fileCount: number
}

export function getFolderDeleteSummary(state: DataRoomState, folderId: NodeId): FolderDeleteSummary {
  const folder = state.foldersById[folderId]

  if (!folder) {
    return { folderCount: 0, fileCount: 0 }
  }

  const dataRoom = state.dataRoomsById[folder.dataRoomId]

  if (!dataRoom || dataRoom.rootFolderId === folderId) {
    return { folderCount: 0, fileCount: 0 }
  }

  const result = collectFolderAndFileIds(state, folderId)

  return {
    folderCount: result.folderCount,
    fileCount: result.fileCount,
  }
}

export function getDataRoomDeleteSummary(state: DataRoomState, dataRoomId: NodeId): DataRoomDeleteSummary {
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return { folderCount: 0, fileCount: 0 }
  }

  const result = collectFolderAndFileIds(state, dataRoom.rootFolderId)

  return {
    folderCount: result.folderCount,
    fileCount: result.fileCount,
  }
}

export function getFileIdsForFolderCascadeDelete(state: DataRoomState, folderId: NodeId): NodeId[] {
  const folder = state.foldersById[folderId]

  if (!folder) {
    return []
  }

  const dataRoom = state.dataRoomsById[folder.dataRoomId]

  if (!dataRoom || dataRoom.rootFolderId === folderId) {
    return []
  }

  return [...collectFolderAndFileIds(state, folderId).fileIds]
}

export function getFileIdsForDataRoomDelete(state: DataRoomState, dataRoomId: NodeId): NodeId[] {
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return []
  }

  return [...collectFolderAndFileIds(state, dataRoom.rootFolderId).fileIds]
}
