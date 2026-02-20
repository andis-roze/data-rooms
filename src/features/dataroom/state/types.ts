import type { DataRoomState, NodeId } from '../model'

export interface DataRoomStoreState {
  entities: DataRoomState
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
}

export type DataRoomAction =
  | {
      type: 'dataroom/rehydrate'
      payload: DataRoomState
    }
  | {
      type: 'dataroom/reset'
      payload?: {
        now?: number
      }
    }
  | {
      type: 'dataroom/selectDataRoom'
      payload: {
        dataRoomId: NodeId
      }
    }
  | {
      type: 'dataroom/selectFolder'
      payload: {
        folderId: NodeId
      }
    }
  | {
      type: 'dataroom/createDataRoom'
      payload: {
        dataRoomId: NodeId
        rootFolderId: NodeId
        dataRoomName: string
        rootFolderName: string
      }
    }
  | {
      type: 'dataroom/renameDataRoom'
      payload: {
        dataRoomId: NodeId
        dataRoomName: string
      }
    }
  | {
      type: 'dataroom/deleteDataRoom'
      payload: {
        dataRoomId: NodeId
      }
    }
  | {
      type: 'dataroom/createFolder'
      payload: {
        dataRoomId: NodeId
        parentFolderId: NodeId
        folderId: NodeId
        folderName: string
      }
    }
  | {
      type: 'dataroom/renameFolder'
      payload: {
        folderId: NodeId
        folderName: string
      }
    }
  | {
      type: 'dataroom/deleteFolder'
      payload: {
        folderId: NodeId
      }
    }
  | {
      type: 'dataroom/moveFolder'
      payload: {
        folderId: NodeId
        destinationFolderId: NodeId
      }
    }
  | {
      type: 'dataroom/uploadFile'
      payload: {
        parentFolderId: NodeId
        fileId: NodeId
        fileName: string
        size: number
        mimeType: 'application/pdf'
      }
    }
  | {
      type: 'dataroom/renameFile'
      payload: {
        fileId: NodeId
        fileName: string
      }
    }
  | {
      type: 'dataroom/deleteFile'
      payload: {
        fileId: NodeId
      }
    }
  | {
      type: 'dataroom/moveFile'
      payload: {
        fileId: NodeId
        destinationFolderId: NodeId
      }
    }
