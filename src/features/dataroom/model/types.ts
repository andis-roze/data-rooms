export type NodeId = string
export type UnixMs = number

export interface DataRoom {
  id: NodeId
  name: string
  rootFolderId: NodeId
  createdAt: UnixMs
  updatedAt: UnixMs
}

export interface Folder {
  id: NodeId
  dataRoomId: NodeId
  parentFolderId: NodeId | null
  name: string
  childFolderIds: NodeId[]
  fileIds: NodeId[]
  createdAt: UnixMs
  updatedAt: UnixMs
}

export interface FileNode {
  id: NodeId
  parentFolderId: NodeId
  name: string
  mimeType: 'application/pdf'
  size: number
  createdAt: UnixMs
  updatedAt: UnixMs
}

export interface DataRoomState {
  schemaVersion: number
  dataRoomOrder: NodeId[]
  dataRoomsById: Record<NodeId, DataRoom>
  foldersById: Record<NodeId, Folder>
  filesById: Record<NodeId, FileNode>
}
