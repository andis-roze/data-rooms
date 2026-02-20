import type { DataRoomState, NodeId } from '../../dataroom/model'

export interface NormalizedSelectionTargets {
  topLevelFolderIds: NodeId[]
  standaloneFileIds: NodeId[]
  itemNames: string[]
}

export function isFolderInDataRoom(state: DataRoomState, folderId: NodeId, dataRoomId: NodeId): boolean {
  const folder = state.foldersById[folderId]
  return Boolean(folder && folder.dataRoomId === dataRoomId)
}

export function isActionableFolder(state: DataRoomState, folderId: NodeId, dataRoomId: NodeId): boolean {
  const folder = state.foldersById[folderId]
  return Boolean(folder && folder.parentFolderId && folder.dataRoomId === dataRoomId)
}

export function isFileInDataRoom(state: DataRoomState, fileId: NodeId, dataRoomId: NodeId): boolean {
  const file = state.filesById[fileId]
  if (!file) {
    return false
  }

  const parentFolder = state.foldersById[file.parentFolderId]
  return parentFolder?.dataRoomId === dataRoomId
}

export function isFolderDescendantOf(state: DataRoomState, folderId: NodeId, possibleAncestorId: NodeId): boolean {
  let currentFolderId: NodeId | null = folderId
  while (currentFolderId) {
    if (currentFolderId === possibleAncestorId) {
      return true
    }
    currentFolderId = state.foldersById[currentFolderId]?.parentFolderId ?? null
  }
  return false
}

export function isNodeInsideFolder(state: DataRoomState, nodeId: NodeId, folderId: NodeId): boolean {
  const folder = state.foldersById[nodeId]
  if (folder) {
    return isFolderDescendantOf(state, folder.id, folderId)
  }

  const file = state.filesById[nodeId]
  if (!file) {
    return false
  }

  return isFolderDescendantOf(state, file.parentFolderId, folderId)
}

function hasSelectedFolderAncestor(
  state: DataRoomState,
  folderId: NodeId,
  selectedFolderIdSet: Set<NodeId>,
): boolean {
  let currentFolder = state.foldersById[folderId]
  while (currentFolder?.parentFolderId) {
    if (selectedFolderIdSet.has(currentFolder.parentFolderId)) {
      return true
    }
    currentFolder = state.foldersById[currentFolder.parentFolderId]
  }
  return false
}

export function getNormalizedSelectionTargets(
  state: DataRoomState,
  itemIds: NodeId[],
  dataRoomId: NodeId,
  resolveFolderName: (name: string) => string,
): NormalizedSelectionTargets {
  const uniqueItemIds = [...new Set(itemIds)]
  const folders = uniqueItemIds
    .map((itemId) => state.foldersById[itemId])
    .filter((folder): folder is NonNullable<typeof folder> => Boolean(folder))
    .filter((folder) => isActionableFolder(state, folder.id, dataRoomId))
  const files = uniqueItemIds
    .map((itemId) => state.filesById[itemId])
    .filter((file): file is NonNullable<typeof file> => Boolean(file))
    .filter((file) => isFileInDataRoom(state, file.id, dataRoomId))

  const selectedFolderIdSet = new Set(folders.map((folder) => folder.id))
  const topLevelFolderIds = folders
    .map((folder) => folder.id)
    .filter((folderId) => !hasSelectedFolderAncestor(state, folderId, selectedFolderIdSet))
  const topLevelFolderIdSet = new Set(topLevelFolderIds)
  const standaloneFileIds = files
    .filter((file) => {
      let currentFolderId: NodeId | null = file.parentFolderId
      while (currentFolderId) {
        if (topLevelFolderIdSet.has(currentFolderId)) {
          return false
        }
        currentFolderId = state.foldersById[currentFolderId]?.parentFolderId ?? null
      }
      return true
    })
    .map((file) => file.id)

  return {
    topLevelFolderIds,
    standaloneFileIds,
    itemNames: [
      ...topLevelFolderIds.map((folderId) => resolveFolderName(state.foldersById[folderId]?.name ?? folderId)),
      ...standaloneFileIds.map((fileId) => state.filesById[fileId]?.name ?? fileId),
    ],
  }
}
