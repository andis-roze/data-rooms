import { describe, expect, it } from 'vitest'
import { createDataRoom, createFile, createFolder, createSeedDataRoomState } from '../../features/dataroom/model'
import type { SortState } from '../../features/home/model/homeViewTypes'
import {
  selectActiveDataRoom,
  selectActiveFolder,
  selectBreadcrumbs,
  selectDataRooms,
  selectRootFolder,
  selectVisibleContentItems,
} from '../../features/home/selectors/homeSelectors'

const NOW = 1_700_000_000_000

function createStateWithChildren() {
  const seed = createSeedDataRoomState(NOW)
  const dataRoomId = seed.dataRoomOrder[0]
  const rootFolderId = seed.dataRoomsById[dataRoomId].rootFolderId

  const withFolders = createFolder(
    createFolder(seed, {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: 'folder-b',
      folderName: 'Bravo',
      now: NOW + 1,
    }),
    {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: 'folder-a',
      folderName: 'Alpha',
      now: NOW + 2,
    },
  )

  return createFile(
    createFile(withFolders, {
      parentFolderId: rootFolderId,
      fileId: 'file-z',
      fileName: 'Zulu.pdf',
      size: 100,
      mimeType: 'application/pdf',
      now: NOW + 3,
    }),
    {
      parentFolderId: rootFolderId,
      fileId: 'file-e',
      fileName: 'Echo.pdf',
      size: 200,
      mimeType: 'application/pdf',
      now: NOW + 4,
    },
  )
}

describe('homeSelectors', () => {
  it('selectDataRooms filters out missing ids from dataRoomOrder', () => {
    const seed = createSeedDataRoomState(NOW)
    const withSecondRoom = createDataRoom(seed, {
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
      now: NOW + 1,
    })

    const state = {
      ...withSecondRoom,
      dataRoomOrder: ['missing-room', withSecondRoom.dataRoomOrder[0], 'room-2'],
    }

    expect(selectDataRooms(state).map((room) => room.id)).toEqual([withSecondRoom.dataRoomOrder[0], 'room-2'])
  })

  it('selectActiveDataRoom falls back to the first available room', () => {
    const seed = createSeedDataRoomState(NOW)
    const withSecondRoom = createDataRoom(seed, {
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
      now: NOW + 1,
    })
    const dataRooms = selectDataRooms(withSecondRoom)

    expect(selectActiveDataRoom(withSecondRoom, null, dataRooms)?.id).toBe(dataRooms[0].id)
    expect(selectActiveDataRoom(withSecondRoom, 'missing-room', dataRooms)?.id).toBe(dataRooms[0].id)
    expect(selectActiveDataRoom(withSecondRoom, 'room-2', dataRooms)?.id).toBe('room-2')
  })

  it('selectRootFolder returns null when no active data room is available', () => {
    const state = createSeedDataRoomState(NOW)

    expect(selectRootFolder(state, undefined)).toBeNull()
  })

  it('selectActiveFolder falls back to root and handles missing root', () => {
    const state = createSeedDataRoomState(NOW)
    const rootFolder = state.foldersById[state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId]

    expect(selectActiveFolder(state, rootFolder, null)?.id).toBe(rootFolder.id)
    expect(selectActiveFolder(state, rootFolder, 'missing-folder')?.id).toBe(rootFolder.id)
    expect(selectActiveFolder(state, null, 'folder-a')).toBeNull()
  })

  it('selectBreadcrumbs derives path from root to active folder', () => {
    const seed = createSeedDataRoomState(NOW)
    const dataRoomId = seed.dataRoomOrder[0]
    const rootFolderId = seed.dataRoomsById[dataRoomId].rootFolderId

    const withFinance = createFolder(seed, {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: 'folder-finance',
      folderName: 'Finance',
      now: NOW + 1,
    })
    const withInvoices = createFolder(withFinance, {
      dataRoomId,
      parentFolderId: 'folder-finance',
      folderId: 'folder-invoices',
      folderName: 'Invoices',
      now: NOW + 2,
    })

    const breadcrumbs = selectBreadcrumbs(withInvoices, withInvoices.foldersById['folder-invoices'])

    expect(breadcrumbs.map((folder) => folder.id)).toEqual([rootFolderId, 'folder-finance', 'folder-invoices'])
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
    const state = createSeedDataRoomState(NOW)
    const rootFolder = state.foldersById[state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId]
    const sortState: SortState = { field: 'name', direction: 'asc' }

    expect(selectVisibleContentItems(state, null, sortState)).toEqual([])
    expect(selectVisibleContentItems(state, rootFolder, sortState)).toEqual([])
  })
})
