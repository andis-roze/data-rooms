import { describe, expect, it } from 'vitest'
import {
  createDataRoom,
  createFile,
  createFolder,
  createSeedDataRoomState,
  deleteDataRoom,
  deleteFile,
  deleteFolderCascade,
  moveFile,
  moveFolder,
  renameDataRoom,
  renameFile,
  renameFolder,
} from '../../features/dataroom/model'

const NOW = 1_700_000_000_000

function createMutationFixture() {
  const seeded = createSeedDataRoomState(NOW)
  const room1Id = seeded.dataRoomOrder[0]
  const room1RootId = seeded.dataRoomsById[room1Id].rootFolderId

  const withFinance = createFolder(seeded, {
    dataRoomId: room1Id,
    parentFolderId: room1RootId,
    folderId: 'folder-finance',
    folderName: 'Finance',
    now: NOW + 1,
  })

  const withLegal = createFolder(withFinance, {
    dataRoomId: room1Id,
    parentFolderId: room1RootId,
    folderId: 'folder-legal',
    folderName: 'Legal',
    now: NOW + 2,
  })

  const withFinanceChild = createFolder(withLegal, {
    dataRoomId: room1Id,
    parentFolderId: 'folder-finance',
    folderId: 'folder-finance-child',
    folderName: '2025',
    now: NOW + 3,
  })

  const withBudgetFile = createFile(withFinanceChild, {
    parentFolderId: 'folder-finance',
    fileId: 'file-budget',
    fileName: 'Budget.pdf',
    size: 100,
    mimeType: 'application/pdf',
    now: NOW + 4,
  })

  const withContractFile = createFile(withBudgetFile, {
    parentFolderId: 'folder-legal',
    fileId: 'file-contract',
    fileName: 'Contract.pdf',
    size: 120,
    mimeType: 'application/pdf',
    now: NOW + 5,
  })

  const withSecondRoom = createDataRoom(withContractFile, {
    dataRoomId: 'dataroom-2',
    rootFolderId: 'folder-root-2',
    dataRoomName: 'Room 2',
    rootFolderName: 'Root 2',
    now: NOW + 6,
  })

  return createFolder(withSecondRoom, {
    dataRoomId: 'dataroom-2',
    parentFolderId: 'folder-root-2',
    folderId: 'folder-room2-a',
    folderName: 'External',
    now: NOW + 7,
  })
}

describe('data room mutation edge branches', () => {
  it('treats rename on a missing data room as no-op', () => {
    const state = createMutationFixture()

    const next = renameDataRoom(state, {
      dataRoomId: 'dataroom-missing',
      dataRoomName: 'New name',
      now: NOW + 100,
    })

    expect(next).toBe(state)
  })

  it('blocks creating a room with a duplicate normalized name', () => {
    const state = createMutationFixture()

    const next = createDataRoom(state, {
      dataRoomId: 'dataroom-3',
      rootFolderId: 'folder-root-3',
      dataRoomName: ' room 2 ',
      rootFolderName: 'Root 3',
      now: NOW + 101,
    })

    expect(next).toBe(state)
    expect(next.dataRoomsById['dataroom-3']).toBeUndefined()
  })

  it('returns noop delete result for unknown room', () => {
    const state = createMutationFixture()

    const result = deleteDataRoom(state, { dataRoomId: 'dataroom-missing' })

    expect(result.deleted).toBe(false)
    expect(result.fallbackDataRoomId).toBeNull()
    expect(result.nextState).toBe(state)
  })
})

describe('folder mutation edge branches', () => {
  it('blocks folder creation for missing or cross-room parent folders', () => {
    const state = createMutationFixture()

    const missingParent = createFolder(state, {
      dataRoomId: state.dataRoomOrder[0],
      parentFolderId: 'folder-missing',
      folderId: 'folder-new-1',
      folderName: 'Ops',
      now: NOW + 110,
    })

    const crossRoomParent = createFolder(state, {
      dataRoomId: state.dataRoomOrder[0],
      parentFolderId: 'folder-room2-a',
      folderId: 'folder-new-2',
      folderName: 'Ops',
      now: NOW + 111,
    })

    expect(missingParent).toBe(state)
    expect(crossRoomParent).toBe(state)
  })

  it('blocks duplicate sibling folder rename', () => {
    const state = createMutationFixture()

    const next = renameFolder(state, {
      folderId: 'folder-legal',
      folderName: ' finance ',
      now: NOW + 112,
    })

    expect(next).toBe(state)
    expect(next.foldersById['folder-legal'].name).toBe('Legal')
  })

  it('blocks moving folder into its descendant', () => {
    const state = createMutationFixture()

    const next = moveFolder(state, {
      folderId: 'folder-finance',
      destinationFolderId: 'folder-finance-child',
      now: NOW + 113,
    })

    expect(next).toBe(state)
  })

  it('blocks cross-room folder move', () => {
    const state = createMutationFixture()

    const next = moveFolder(state, {
      folderId: 'folder-finance-child',
      destinationFolderId: 'folder-room2-a',
      now: NOW + 114,
    })

    expect(next).toBe(state)
  })

  it('protects root folder from cascade deletion', () => {
    const state = createMutationFixture()
    const room1RootId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    const result = deleteFolderCascade(state, {
      folderId: room1RootId,
      now: NOW + 115,
    })

    expect(result.deleted).toBe(false)
    expect(result.deletedFolderCount).toBe(0)
    expect(result.deletedFileCount).toBe(0)
    expect(result.fallbackFolderId).toBeNull()
    expect(result.nextState).toBe(state)
  })
})

describe('file mutation edge branches', () => {
  it('blocks file rename to duplicate normalized sibling name', () => {
    const state = createMutationFixture()

    const withSecondFile = createFile(state, {
      parentFolderId: 'folder-finance',
      fileId: 'file-budget-v2',
      fileName: 'Budget-v2.pdf',
      size: 80,
      mimeType: 'application/pdf',
      now: NOW + 120,
    })

    const next = renameFile(withSecondFile, {
      fileId: 'file-budget-v2',
      fileName: ' budget.PDF ',
      now: NOW + 121,
    })

    expect(next).toBe(withSecondFile)
    expect(next.filesById['file-budget-v2'].name).toBe('Budget-v2.pdf')
  })

  it('blocks cross-room file move', () => {
    const state = createMutationFixture()

    const next = moveFile(state, {
      fileId: 'file-budget',
      destinationFolderId: 'folder-room2-a',
      now: NOW + 122,
    })

    expect(next).toBe(state)
  })

  it('treats delete as no-op when parent folder is missing', () => {
    const state = createMutationFixture()
    const corruptedState = {
      ...state,
      foldersById: Object.fromEntries(Object.entries(state.foldersById).filter(([id]) => id !== 'folder-legal')),
    }

    const next = deleteFile(corruptedState, {
      fileId: 'file-contract',
      now: NOW + 123,
    })

    expect(next).toBe(corruptedState)
    expect(next.filesById['file-contract']).toBeDefined()
  })
})
