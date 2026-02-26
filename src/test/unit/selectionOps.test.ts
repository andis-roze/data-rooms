import { describe, expect, it } from 'vitest'
import { createDataRoom, createFile, createFolder, createSeedDataRoomState } from '../../features/dataroom/model'
import {
  getNormalizedSelectionTargets,
  isActionableFolder,
  isFileInDataRoom,
  isFolderInDataRoom,
  isFolderDescendantOf,
  isNodeInsideFolder,
} from '../../features/home/model/selectionOps'

const NOW = 1_700_000_000_000

function createSelectionState() {
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

  const withLegal = createFolder(withFinance, {
    dataRoomId,
    parentFolderId: rootFolderId,
    folderId: 'folder-legal',
    folderName: 'Legal',
    now: NOW + 2,
  })

  const withNested = createFolder(withLegal, {
    dataRoomId,
    parentFolderId: 'folder-finance',
    folderId: 'folder-finance-2024',
    folderName: '2024',
    now: NOW + 3,
  })

  const withTopFile = createFile(withNested, {
    parentFolderId: 'folder-finance',
    fileId: 'file-budget',
    fileName: 'Budget.pdf',
    size: 100,
    mimeType: 'application/pdf',
    now: NOW + 4,
  })

  return createFile(withTopFile, {
    parentFolderId: 'folder-finance-2024',
    fileId: 'file-q1',
    fileName: 'Q1.pdf',
    size: 200,
    mimeType: 'application/pdf',
    now: NOW + 5,
  })
}

describe('selectionOps', () => {
  it('normalizes selection targets by removing nested folders and files under selected folders', () => {
    const state = createSelectionState()
    const dataRoomId = state.dataRoomOrder[0]

    const targets = getNormalizedSelectionTargets(
      state,
      ['folder-finance', 'folder-finance-2024', 'file-budget', 'file-q1'],
      dataRoomId,
      (name) => name,
    )

    expect(targets.topLevelFolderIds).toEqual(['folder-finance'])
    expect(targets.standaloneFileIds).toEqual([])
    expect(targets.itemNames).toEqual(['Finance'])
  })

  it('keeps standalone files when parent folders are not selected', () => {
    const state = createSelectionState()
    const dataRoomId = state.dataRoomOrder[0]

    const targets = getNormalizedSelectionTargets(state, ['file-budget', 'file-q1'], dataRoomId, (name) => name)

    expect(targets.topLevelFolderIds).toEqual([])
    expect(targets.standaloneFileIds).toEqual(['file-budget', 'file-q1'])
  })

  it('checks folder ancestry and node containment for folders and files', () => {
    const state = createSelectionState()

    expect(isFolderDescendantOf(state, 'folder-finance-2024', 'folder-finance')).toBe(true)
    expect(isFolderDescendantOf(state, 'folder-legal', 'folder-finance')).toBe(false)
    expect(isNodeInsideFolder(state, 'folder-finance-2024', 'folder-finance')).toBe(true)
    expect(isNodeInsideFolder(state, 'file-q1', 'folder-finance')).toBe(true)
    expect(isNodeInsideFolder(state, 'file-q1', 'folder-legal')).toBe(false)
  })

  it('deduplicates repeated ids while normalizing selection targets', () => {
    const state = createSelectionState()
    const dataRoomId = state.dataRoomOrder[0]

    const targets = getNormalizedSelectionTargets(
      state,
      ['folder-finance', 'folder-finance', 'file-budget', 'file-budget'],
      dataRoomId,
      (name) => name,
    )

    expect(targets.topLevelFolderIds).toEqual(['folder-finance'])
    expect(targets.standaloneFileIds).toEqual([])
    expect(targets.itemNames).toEqual(['Finance'])
  })

  it('ignores root, missing, and cross-room ids when normalizing targets', () => {
    const state = createSelectionState()
    const primaryRoomId = state.dataRoomOrder[0]
    const rootFolderId = state.dataRoomsById[primaryRoomId].rootFolderId

    const withSecondRoom = createDataRoom(state, {
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
      now: NOW + 10,
    })
    const withSecondRoomFile = createFile(withSecondRoom, {
      parentFolderId: 'room-2-root',
      fileId: 'file-room-2',
      fileName: 'OnlyInRoom2.pdf',
      size: 50,
      mimeType: 'application/pdf',
      now: NOW + 11,
    })

    const targets = getNormalizedSelectionTargets(
      withSecondRoomFile,
      [rootFolderId, 'missing-id', 'file-room-2', 'folder-finance'],
      primaryRoomId,
      (name) => name,
    )

    expect(targets.topLevelFolderIds).toEqual(['folder-finance'])
    expect(targets.standaloneFileIds).toEqual([])
    expect(targets.itemNames).toEqual(['Finance'])
  })

  it('returns false for missing nodes in containment and room checks', () => {
    const state = createSelectionState()
    const dataRoomId = state.dataRoomOrder[0]

    expect(isNodeInsideFolder(state, 'missing-node', 'folder-finance')).toBe(false)
    expect(isFolderInDataRoom(state, 'missing-folder', dataRoomId)).toBe(false)
    expect(isActionableFolder(state, 'missing-folder', dataRoomId)).toBe(false)
    expect(isFileInDataRoom(state, 'missing-file', dataRoomId)).toBe(false)
  })

  it('treats a folder as its own descendant for move-validation ancestry checks', () => {
    const state = createSelectionState()

    expect(isFolderDescendantOf(state, 'folder-finance', 'folder-finance')).toBe(true)
    expect(isFolderDescendantOf(state, 'missing-folder', 'folder-finance')).toBe(false)
  })

  it('limits file-in-room checks to the requested room', () => {
    const state = createSelectionState()
    const withSecondRoom = createDataRoom(state, {
      dataRoomId: 'room-2',
      rootFolderId: 'room-2-root',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root',
      now: NOW + 6,
    })

    const withSecondRoomFile = createFile(withSecondRoom, {
      parentFolderId: 'room-2-root',
      fileId: 'file-room-2',
      fileName: 'OnlyInRoom2.pdf',
      size: 50,
      mimeType: 'application/pdf',
      now: NOW + 7,
    })

    expect(isFileInDataRoom(withSecondRoomFile, 'file-room-2', 'room-2')).toBe(true)
    expect(isFileInDataRoom(withSecondRoomFile, 'file-room-2', withSecondRoomFile.dataRoomOrder[0])).toBe(false)
  })
})
