import type { FileNode, Folder, NodeId } from '../dataroom/model'

export interface FeedbackState {
  id: number
  message: string
  severity: 'success' | 'error'
}

export type SortField = 'name' | 'type' | 'updated'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

export interface FolderContentItem {
  kind: 'folder' | 'file'
  id: NodeId
  name: string
  displayName?: string
  updatedAt: number
  folder?: Folder
  file?: FileNode
  isParentNavigation?: boolean
}
