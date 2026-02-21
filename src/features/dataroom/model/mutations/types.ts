import type { DataRoomState, NodeId, UnixMs } from '../types'

export interface CreateDataRoomInput {
  dataRoomId: NodeId
  rootFolderId: NodeId
  dataRoomName: string
  rootFolderName: string
  now: UnixMs
}

export interface RenameDataRoomInput {
  dataRoomId: NodeId
  dataRoomName: string
  now: UnixMs
}

export interface DeleteDataRoomInput {
  dataRoomId: NodeId
}

export interface DeleteDataRoomResult {
  nextState: DataRoomState
  deleted: boolean
  fallbackDataRoomId: NodeId | null
}

export interface CreateFolderInput {
  dataRoomId: NodeId
  parentFolderId: NodeId
  folderId: NodeId
  folderName: string
  now: UnixMs
}

export interface RenameFolderInput {
  folderId: NodeId
  folderName: string
  now: UnixMs
}

export interface DeleteFolderCascadeInput {
  folderId: NodeId
  now: UnixMs
}

export interface DeleteFolderCascadeResult {
  nextState: DataRoomState
  deleted: boolean
  fallbackFolderId: NodeId | null
  deletedFolderCount: number
  deletedFileCount: number
}

export interface CreateFileInput {
  parentFolderId: NodeId
  fileId: NodeId
  fileName: string
  size: number
  mimeType: 'application/pdf'
  now: UnixMs
}

export interface RenameFileInput {
  fileId: NodeId
  fileName: string
  now: UnixMs
}

export interface DeleteFileInput {
  fileId: NodeId
  now: UnixMs
}

export interface MoveFolderInput {
  folderId: NodeId
  destinationFolderId: NodeId
  now: UnixMs
}

export interface MoveFileInput {
  fileId: NodeId
  destinationFolderId: NodeId
  now: UnixMs
}
