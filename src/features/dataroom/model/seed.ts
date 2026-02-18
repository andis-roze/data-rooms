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
        name: 'i18n:dataroomSeedDefaultDataRoomName',
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
        name: 'i18n:dataroomSeedDefaultRootFolderName',
        childFolderIds: [],
        fileIds: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    filesById: {},
  }
}
