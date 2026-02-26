import { describe, expect, it } from 'vitest'
import { createDataRoom, createFolder, createSeedDataRoomState } from '../../features/dataroom/model'
import { createInitialDataRoomStoreState, dataRoomReducer } from '../../features/dataroom/state/reducer'
import type { DataRoomAction, DataRoomStoreState } from '../../features/dataroom/state/types'

const NOW = 1_700_000_000_000

function createReducerFixture() {
  let entities = createSeedDataRoomState(NOW)

  const room1Id = entities.dataRoomOrder[0]
  const room1RootId = entities.dataRoomsById[room1Id].rootFolderId

  entities = createFolder(entities, {
    dataRoomId: room1Id,
    parentFolderId: room1RootId,
    folderId: 'folder-room1-a',
    folderName: 'Finance',
    now: NOW + 1,
  })

  entities = createDataRoom(entities, {
    dataRoomId: 'dataroom-2',
    rootFolderId: 'folder-root-2',
    dataRoomName: 'Room 2',
    rootFolderName: 'Root 2',
    now: NOW + 2,
  })

  entities = createFolder(entities, {
    dataRoomId: 'dataroom-2',
    parentFolderId: 'folder-root-2',
    folderId: 'folder-room2-a',
    folderName: 'Legal',
    now: NOW + 3,
  })

  return {
    entities,
    room1Id,
    room1RootId,
    room1ChildId: 'folder-room1-a',
    room2Id: 'dataroom-2',
    room2RootId: 'folder-root-2',
    room2ChildId: 'folder-room2-a',
  }
}

describe('dataRoomReducer', () => {
  it('treats selecting invalid entities as a no-op', () => {
    const { entities } = createReducerFixture()
    const state = createInitialDataRoomStoreState(entities)

    const afterMissingDataRoomSelect = dataRoomReducer(state, {
      type: 'dataroom/selectDataRoom',
      payload: { dataRoomId: 'dataroom-missing' },
    })

    const afterMissingFolderSelect = dataRoomReducer(state, {
      type: 'dataroom/selectFolder',
      payload: { folderId: 'folder-missing' },
    })

    expect(afterMissingDataRoomSelect).toBe(state)
    expect(afterMissingFolderSelect).toBe(state)
  })

  it('resolves selection during rehydrate when selected folder no longer exists', () => {
    const { entities, room2Id, room2RootId, room2ChildId } = createReducerFixture()

    const rehydratedEntities = {
      ...entities,
      foldersById: Object.fromEntries(
        Object.entries(entities.foldersById).filter(([id]) => id !== room2ChildId),
      ),
    }

    rehydratedEntities.foldersById[room2RootId] = {
      ...rehydratedEntities.foldersById[room2RootId],
      childFolderIds: rehydratedEntities.foldersById[room2RootId].childFolderIds.filter(
        (id) => id !== room2ChildId,
      ),
    }

    const state: DataRoomStoreState = {
      entities,
      selectedDataRoomId: room2Id,
      selectedFolderId: room2ChildId,
    }

    const next = dataRoomReducer(state, {
      type: 'dataroom/rehydrate',
      payload: rehydratedEntities,
    })

    expect(next.entities).toBe(rehydratedEntities)
    expect(next.selectedDataRoomId).toBe(room2Id)
    expect(next.selectedFolderId).toBe(room2RootId)
  })

  it('switches selection to the newly created data room', () => {
    const { entities } = createReducerFixture()
    const state = createInitialDataRoomStoreState(entities)

    const next = dataRoomReducer(state, {
      type: 'dataroom/createDataRoom',
      payload: {
        dataRoomId: 'dataroom-3',
        rootFolderId: 'folder-root-3',
        dataRoomName: 'Room 3',
        rootFolderName: 'Root 3',
      },
    })

    expect(next.selectedDataRoomId).toBe('dataroom-3')
    expect(next.selectedFolderId).toBe('folder-root-3')
    expect(next.entities.dataRoomsById['dataroom-3']).toBeDefined()
  })

  it('falls back selection after deleting a data room', () => {
    const { entities, room1Id, room1RootId, room2Id, room2RootId } = createReducerFixture()

    const state: DataRoomStoreState = {
      entities,
      selectedDataRoomId: room2Id,
      selectedFolderId: room2RootId,
    }

    const next = dataRoomReducer(state, {
      type: 'dataroom/deleteDataRoom',
      payload: { dataRoomId: room2Id },
    })

    expect(next.entities.dataRoomsById[room2Id]).toBeUndefined()
    expect(next.selectedDataRoomId).toBe(room1Id)
    expect(next.selectedFolderId).toBe(room1RootId)
  })

  it('reselects a valid folder after createFolder when current folder selection is stale', () => {
    const { entities, room1Id, room1RootId } = createReducerFixture()

    const state: DataRoomStoreState = {
      entities,
      selectedDataRoomId: room1Id,
      selectedFolderId: 'folder-missing',
    }

    const next = dataRoomReducer(state, {
      type: 'dataroom/createFolder',
      payload: {
        dataRoomId: room1Id,
        parentFolderId: room1RootId,
        folderId: 'folder-room1-b',
        folderName: 'Ops',
      },
    })

    expect(next.entities.foldersById['folder-room1-b']).toBeDefined()
    expect(next.selectedDataRoomId).toBe(room1Id)
    expect(next.selectedFolderId).toBe(room1RootId)
  })

  it('falls back to parent selection after deleting selected folder', () => {
    const { entities, room1Id, room1RootId, room1ChildId } = createReducerFixture()

    const state: DataRoomStoreState = {
      entities,
      selectedDataRoomId: room1Id,
      selectedFolderId: room1ChildId,
    }

    const next = dataRoomReducer(state, {
      type: 'dataroom/deleteFolder',
      payload: { folderId: room1ChildId },
    })

    expect(next.entities.foldersById[room1ChildId]).toBeUndefined()
    expect(next.selectedDataRoomId).toBe(room1Id)
    expect(next.selectedFolderId).toBe(room1RootId)
  })

  it('passes unknown actions through unchanged', () => {
    const { entities } = createReducerFixture()
    const state = createInitialDataRoomStoreState(entities)

    const next = dataRoomReducer(state, {
      type: 'dataroom/unknown',
    } as unknown as DataRoomAction)

    expect(next).toBe(state)
  })
})
