import type { FileNode, Folder, NodeId } from '../../dataroom/model'

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

export interface FolderItem {
  kind: 'folder'
  id: NodeId
  name: string
  updatedAt: number
  folder: Folder
}

export interface FileItem {
  kind: 'file'
  id: NodeId
  name: string
  updatedAt: number
  file: FileNode
}

export type FolderContentItem = FolderItem | FileItem
