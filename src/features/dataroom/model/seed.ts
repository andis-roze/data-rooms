import type { DataRoomState } from './types'

export const DATAROOM_SCHEMA_VERSION = 1

export function createSeedDataRoomState(now: number = Date.now()): DataRoomState {
  const dataRoomId = 'dataroom-1'
  const rootFolderId = 'folder-root'

  return {
    schemaVersion: DATAROOM_SCHEMA_VERSION,
    dataRoomOrder: [dataRoomId],
    dataRoomsById: {
      [dataRoomId]: {
        id: dataRoomId,
        name: 'Acme Due Diligence Room',
        rootFolderId,
        createdAt: now,
        updatedAt: now,
      },
    },
    foldersById: {
      [rootFolderId]: {
        id: rootFolderId,
        dataRoomId,
        parentFolderId: null,
        name: 'Data Room',
        childFolderIds: [],
        fileIds: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    filesById: {},
  }
}
