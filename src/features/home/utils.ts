import type { DataRoomState, FileNode, Folder, NodeId } from '../dataroom/model'
import type { SortState } from './types'

const SORT_PREFERENCE_STORAGE_KEY = 'dataroom/view-preferences'
let inMemorySortPreference: SortState = { field: 'name', direction: 'asc' }

function fallbackUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function generateNodeId(prefix: 'folder' | 'file' | 'dataroom'): NodeId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${fallbackUuidV4()}`
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export function byNameAsc(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

export function getFolderChildren(state: DataRoomState, folder: Folder): Folder[] {
  return folder.childFolderIds.map((id) => state.foldersById[id]).filter(isDefined).sort(byNameAsc)
}

export function getFileChildren(state: DataRoomState, folder: Folder): FileNode[] {
  return folder.fileIds.map((id) => state.filesById[id]).filter(isDefined).sort(byNameAsc)
}

export function loadSortModePreference(): SortState {
  if (typeof window === 'undefined') {
    return inMemorySortPreference
  }

  try {
    const raw = window.localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY)

    if (!raw) {
      return inMemorySortPreference
    }

    const parsed = JSON.parse(raw) as { sortField?: string; sortDirection?: string; sortMode?: string }

    if (
      (parsed.sortField === 'name' || parsed.sortField === 'type' || parsed.sortField === 'updated') &&
      (parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc')
    ) {
      return { field: parsed.sortField, direction: parsed.sortDirection }
    }

    // Backward compatibility with previous select-based sort mode.
    if (parsed.sortMode === 'name-asc') {
      return { field: 'name', direction: 'asc' }
    }
    if (parsed.sortMode === 'name-desc') {
      return { field: 'name', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-desc') {
      return { field: 'updated', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-asc') {
      return { field: 'updated', direction: 'asc' }
    }
    if (parsed.sortMode === 'type') {
      return { field: 'type', direction: 'asc' }
    }
  } catch {
    return inMemorySortPreference
  }

  return inMemorySortPreference
}

export function saveSortModePreference(sortState: SortState): void {
  inMemorySortPreference = sortState

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      SORT_PREFERENCE_STORAGE_KEY,
      JSON.stringify({ sortField: sortState.field, sortDirection: sortState.direction }),
    )
  } catch {
    // Ignore persistence failures and keep in-memory preference.
  }
}

export function buildFolderPath(state: DataRoomState, folderId: NodeId): Folder[] {
  const path: Folder[] = []
  const visited = new Set<NodeId>()
  let currentId: NodeId | null = folderId

  while (currentId) {
    if (visited.has(currentId)) {
      break
    }

    visited.add(currentId)
    const folder: Folder | undefined = state.foldersById[currentId]

    if (!folder) {
      break
    }

    path.push(folder)
    currentId = folder.parentFolderId
  }

  return path.reverse()
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export function formatUpdatedAt(value: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}
