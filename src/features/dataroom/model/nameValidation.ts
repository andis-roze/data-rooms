import type { DataRoomState, NodeId } from './types'

export function normalizeNodeName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

function getNodeNameValidationError(name: string, nodeLabel: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return `${nodeLabel} name cannot be empty.`
  }

  if (trimmed === '.' || trimmed === '..') {
    return `${nodeLabel} name is not allowed.`
  }

  return null
}

export function getFolderNameValidationError(name: string): string | null {
  return getNodeNameValidationError(name, 'Folder')
}

export function getFileNameValidationError(name: string): string | null {
  return getNodeNameValidationError(name, 'File')
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
