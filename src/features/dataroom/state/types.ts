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
