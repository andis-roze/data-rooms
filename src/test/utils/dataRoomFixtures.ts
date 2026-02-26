import {
  createDataRoom,
  createFile,
  createFolder,
  createSeedDataRoomState,
  type DataRoomState,
  type NodeId,
} from '../../features/dataroom/model'

export const FIXTURE_NOW = 1_700_000_000_000

interface AddDataRoomInput {
  dataRoomId: NodeId
  rootFolderId: NodeId
  dataRoomName: string
  rootFolderName: string
  now?: number
}

interface AddFolderInput {
  dataRoomId: NodeId
  parentFolderId: NodeId
  folderId: NodeId
  folderName: string
  now?: number
}

interface AddFileInput {
  parentFolderId: NodeId
  fileId: NodeId
  fileName: string
  size: number
  mimeType: 'application/pdf'
  now?: number
}

export interface DataRoomFixtureBuilder {
  readonly entities: DataRoomState
  readonly seedDataRoomId: NodeId
  readonly seedRootFolderId: NodeId
  addDataRoom(input: AddDataRoomInput): DataRoomFixtureBuilder
  addFolder(input: AddFolderInput): DataRoomFixtureBuilder
  addFile(input: AddFileInput): DataRoomFixtureBuilder
  build(): DataRoomState
}

export function createDataRoomFixtureBuilder(now: number = FIXTURE_NOW): DataRoomFixtureBuilder {
  let currentNow = now
  let entities = createSeedDataRoomState(now)

  const seedDataRoomId = entities.dataRoomOrder[0]
  const seedRootFolderId = entities.dataRoomsById[seedDataRoomId].rootFolderId

  const nextNow = () => {
    currentNow += 1
    return currentNow
  }

  const resolveNow = (value?: number) => (value === undefined ? nextNow() : value)

  const builder: DataRoomFixtureBuilder = {
    get entities() {
      return entities
    },
    seedDataRoomId,
    seedRootFolderId,
    addDataRoom(input) {
      entities = createDataRoom(entities, {
        ...input,
        now: resolveNow(input.now),
      })
      return builder
    },
    addFolder(input) {
      entities = createFolder(entities, {
        ...input,
        now: resolveNow(input.now),
      })
      return builder
    },
    addFile(input) {
      entities = createFile(entities, {
        ...input,
        now: resolveNow(input.now),
      })
      return builder
    },
    build() {
      return entities
    },
  }

  return builder
}
