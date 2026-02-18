import type { DataRoomState, NodeId } from './types'

export type NodeNameValidationError = 'empty' | 'reserved'

export function normalizeNodeName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

function getNodeNameValidationError(name: string): NodeNameValidationError | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'empty'
  }

  if (trimmed === '.' || trimmed === '..') {
    return 'reserved'
  }

  return null
}

export function getFolderNameValidationError(name: string): NodeNameValidationError | null {
  return getNodeNameValidationError(name)
}

export function getFileNameValidationError(name: string): NodeNameValidationError | null {
  return getNodeNameValidationError(name)
}

export function hasDuplicateFolderName(
  state: DataRoomState,
  parentFolderId: NodeId | null,
  folderName: string,
  excludeFolderId?: NodeId,
): boolean {
  if (!parentFolderId) {
    return false
  }

  const parent = state.foldersById[parentFolderId]

  if (!parent) {
    return false
  }

  const normalizedCandidate = normalizeNodeName(folderName)

  return parent.childFolderIds.some((childFolderId) => {
    if (excludeFolderId && childFolderId === excludeFolderId) {
      return false
    }

    const child = state.foldersById[childFolderId]

    if (!child) {
      return false
    }

    return normalizeNodeName(child.name) === normalizedCandidate
  })
}

export function hasDuplicateFileName(
  state: DataRoomState,
  parentFolderId: NodeId,
  fileName: string,
  excludeFileId?: NodeId,
): boolean {
  const parent = state.foldersById[parentFolderId]

  if (!parent) {
    return false
  }

  const normalizedCandidate = normalizeNodeName(fileName)

  return parent.fileIds.some((fileId) => {
    if (excludeFileId && fileId === excludeFileId) {
      return false
    }

    const file = state.filesById[fileId]

    if (!file) {
      return false
    }

    return normalizeNodeName(file.name) === normalizedCandidate
  })
}
