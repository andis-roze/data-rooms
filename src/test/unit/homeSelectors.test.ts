import { describe, expect, it } from 'vitest'
import type { SortState } from '../../features/home/model/homeViewTypes'
import {
  selectActiveDataRoom,
  selectActiveFolder,
  selectBreadcrumbs,
  selectDataRooms,
  selectRootFolder,
  selectVisibleContentItems,
} from '../../features/home/selectors/homeSelectors'
import { createDataRoomFixtureBuilder } from '../utils/dataRoomFixtures'

function createStateWithChildren() {
  const builder = createDataRoomFixtureBuilder()

  builder
    .addFolder({
      dataRoomId: builder.seedDataRoomId,
      parentFolderId: builder.seedRootFolderId,
      folderId: 'folder-b',
      folderName: 'Bravo',
    })
    .addFolder({
      dataRoomId: builder.seedDataRoomId,
      parentFolderId: builder.seedRootFolderId,
      folderId: 'folder-a',
      folderName: 'Alpha',
    })
    .addFile({
      parentFolderId: builder.seedRootFolderId,
      fileId: 'file-z',
      fileName: 'Zulu.pdf',
      size: 100,
      mimeType: 'application/pdf',
    })
    .addFile({
      parentFolderId: builder.seedRootFolderId,
      fileId: 'file-e',
      fileName: 'Echo.pdf',
      size: 200,
      mimeType: 'application/pdf',
    })

  return builder.build()
}

describe('homeSelectors', () => {
  it('selectDataRooms filters out missing ids from dataRoomOrder', () => {
    const builder = createDataRoomFixtureBuilder()
    builder.addDataRoom({
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
    })
    const withSecondRoom = builder.build()

    const state = {
      ...withSecondRoom,
      dataRoomOrder: ['missing-room', withSecondRoom.dataRoomOrder[0], 'room-2'],
    }

    expect(selectDataRooms(state).map((room) => room.id)).toEqual([withSecondRoom.dataRoomOrder[0], 'room-2'])
  })

  it('selectActiveDataRoom falls back to the first available room', () => {
    const builder = createDataRoomFixtureBuilder()
    builder.addDataRoom({
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
    })
    const withSecondRoom = builder.build()
    const dataRooms = selectDataRooms(withSecondRoom)

    expect(selectActiveDataRoom(withSecondRoom, null, dataRooms)?.id).toBe(dataRooms[0].id)
    expect(selectActiveDataRoom(withSecondRoom, 'missing-room', dataRooms)?.id).toBe(dataRooms[0].id)
    expect(selectActiveDataRoom(withSecondRoom, 'room-2', dataRooms)?.id).toBe('room-2')
  })

  it('selectRootFolder returns null when no active data room is available', () => {
    const state = createDataRoomFixtureBuilder().build()

    expect(selectRootFolder(state, undefined)).toBeNull()
  })

  it('selectActiveFolder falls back to root and handles missing root', () => {
    const state = createDataRoomFixtureBuilder().build()
    const rootFolder = state.foldersById[state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId]

    expect(selectActiveFolder(state, rootFolder, null)?.id).toBe(rootFolder.id)
    expect(selectActiveFolder(state, rootFolder, 'missing-folder')?.id).toBe(rootFolder.id)
    expect(selectActiveFolder(state, null, 'folder-a')).toBeNull()
  })

  it('selectBreadcrumbs derives path from root to active folder', () => {
    const builder = createDataRoomFixtureBuilder()
    builder.addFolder({
      dataRoomId: builder.seedDataRoomId,
      parentFolderId: builder.seedRootFolderId,
      folderId: 'folder-finance',
      folderName: 'Finance',
    })
    builder.addFolder({
      dataRoomId: builder.seedDataRoomId,
      parentFolderId: 'folder-finance',
      folderId: 'folder-invoices',
      folderName: 'Invoices',
    })
    const withInvoices = builder.build()

    const breadcrumbs = selectBreadcrumbs(withInvoices, withInvoices.foldersById['folder-invoices'])

    expect(breadcrumbs.map((folder) => folder.id)).toEqual([
      builder.seedRootFolderId,
      'folder-finance',
      'folder-invoices',
    ])
  })

  it('selectVisibleContentItems sorts mixed child content by requested sort state', () => {
    const state = createStateWithChildren()
    const rootFolder = state.foldersById[state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId]
    const byTypeAsc: SortState = { field: 'type', direction: 'asc' }
    const byUpdatedDesc: SortState = { field: 'updated', direction: 'desc' }

    const byType = selectVisibleContentItems(state, rootFolder, byTypeAsc)
    const byUpdated = selectVisibleContentItems(state, rootFolder, byUpdatedDesc)

    expect(byType.map((item) => item.id)).toEqual(['folder-a', 'folder-b', 'file-e', 'file-z'])
    expect(byUpdated.map((item) => item.id)).toEqual(['file-e', 'file-z', 'folder-a', 'folder-b'])
  })

  it('selectVisibleContentItems returns empty for null active folder and empty folders', () => {
    const state = createDataRoomFixtureBuilder().build()
    const rootFolder = state.foldersById[state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId]
    const sortState: SortState = { field: 'name', direction: 'asc' }

    expect(selectVisibleContentItems(state, null, sortState)).toEqual([])
    expect(selectVisibleContentItems(state, rootFolder, sortState)).toEqual([])
  })
})
