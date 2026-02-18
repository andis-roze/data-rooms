import type { DataRoomState, NodeId } from './types'

// Collects folder/file ids affected by cascading delete operations.
export interface DeleteTargets {
  folderIds: Set<NodeId>
  fileIds: Set<NodeId>
  folderCount: number
  fileCount: number
}

export function collectFolderAndFileIds(state: DataRoomState, rootFolderId: NodeId): DeleteTargets {
  const folderIds = new Set<NodeId>()
  const fileIds = new Set<NodeId>()
  const stack: NodeId[] = [rootFolderId]

  while (stack.length > 0) {
    const currentId = stack.pop()

    if (!currentId || folderIds.has(currentId)) {
      continue
    }

    const currentFolder = state.foldersById[currentId]

    if (!currentFolder) {
      continue
    }

    folderIds.add(currentId)

    currentFolder.fileIds.forEach((fileId) => {
      fileIds.add(fileId)
    })

    currentFolder.childFolderIds.forEach((childFolderId) => {
      if (!folderIds.has(childFolderId)) {
        stack.push(childFolderId)
      }
    })
  }

  return {
    folderIds,
    fileIds,
    folderCount: folderIds.size,
    fileCount: fileIds.size,
  }
}
