import type { DataRoomState, NodeId } from './types'

export function normalizeNodeName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

export function getFolderNameValidationError(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Folder name cannot be empty.'
  }

  if (trimmed === '.' || trimmed === '..') {
    return 'Folder name is not allowed.'
  }

  return null
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
