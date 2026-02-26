import { describe, expect, it } from 'vitest'
import {
  createDataRoom,
  createFile,
  createFolder,
  createSeedDataRoomState,
  deleteFolderCascade,
  getDataRoomNameValidationError,
  getFileIdsForFolderCascadeDelete,
  getFileNameValidationError,
  getFolderDeleteSummary,
  getFolderNameValidationError,
  hasDuplicateDataRoomName,
  hasDuplicateFileName,
  hasDuplicateFolderName,
  moveFile,
  moveFolder,
  renameFile,
  renameFolder,
} from '../../features/dataroom/model'
import type { FolderContentItem } from '../../features/home/model/homeViewTypes'
import { getNextSortState, sortContentItems } from '../../features/home/selectors/homeSorting'

const NOW = 1_700_000_000_000

function createStateWithNestedTree() {
  const seeded = createSeedDataRoomState(NOW)
  const rootFolderId = seeded.dataRoomsById[seeded.dataRoomOrder[0]].rootFolderId

  const withFolderA = createFolder(seeded, {
    dataRoomId: seeded.dataRoomOrder[0],
    parentFolderId: rootFolderId,
    folderId: 'folder-a',
    folderName: 'Finance',
    now: NOW + 1,
  })

  const withFolderB = createFolder(withFolderA, {
    dataRoomId: seeded.dataRoomOrder[0],
    parentFolderId: rootFolderId,
    folderId: 'folder-b',
    folderName: 'Legal',
    now: NOW + 2,
  })

  const withNestedFolder = createFolder(withFolderB, {
    dataRoomId: seeded.dataRoomOrder[0],
    parentFolderId: 'folder-a',
    folderId: 'folder-a-1',
    folderName: 'Invoices',
    now: NOW + 3,
  })

  const withFileA = createFile(withNestedFolder, {
    parentFolderId: 'folder-a',
    fileId: 'file-a',
    fileName: 'Q1.pdf',
    size: 100,
    mimeType: 'application/pdf',
    now: NOW + 4,
  })

  return createFile(withFileA, {
    parentFolderId: 'folder-a-1',
    fileId: 'file-b',
    fileName: 'Q2.pdf',
    size: 120,
    mimeType: 'application/pdf',
    now: NOW + 5,
  })
}

describe('name validation', () => {
  it('rejects empty and reserved names', () => {
    expect(getFolderNameValidationError('   ')).toBe('empty')
    expect(getFolderNameValidationError('.')).toBe('reserved')
    expect(getFileNameValidationError('..')).toBe('reserved')
    expect(getDataRoomNameValidationError('Data Room')).toBeNull()
  })
})

describe('duplicate checks', () => {
  it('treats names as trim-normalized and case-insensitive', () => {
    const state = createStateWithNestedTree()
    const rootFolderId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    expect(hasDuplicateFolderName(state, rootFolderId, '  finance  ')).toBe(true)
    expect(hasDuplicateFileName(state, 'folder-a', ' q1.PDF ')).toBe(true)
  })

  it('supports exclusions during rename', () => {
    const state = createStateWithNestedTree()

    expect(hasDuplicateFolderName(state, state.foldersById['folder-a'].parentFolderId, 'Finance', 'folder-a')).toBe(false)
    expect(hasDuplicateFileName(state, 'folder-a', 'Q1.pdf', 'file-a')).toBe(false)
  })

  it('checks data room duplicates with optional exclusion', () => {
    const seed = createSeedDataRoomState(NOW)
    const withSecondRoom = createDataRoom(seed, {
      dataRoomId: 'dataroom-2',
      rootFolderId: 'root-2',
      dataRoomName: 'Transactions',
      rootFolderName: 'Root',
      now: NOW + 1,
    })

    expect(hasDuplicateDataRoomName(withSecondRoom, ' transactions ')).toBe(true)
    expect(hasDuplicateDataRoomName(withSecondRoom, 'transactions', 'dataroom-2')).toBe(false)
  })
})

describe('tree mutations', () => {
  it('blocks duplicate folder creation in the same parent', () => {
    const state = createStateWithNestedTree()
    const rootFolderId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    const next = createFolder(state, {
      dataRoomId: state.dataRoomOrder[0],
      parentFolderId: rootFolderId,
      folderId: 'folder-duplicate',
      folderName: ' finance ',
      now: NOW + 10,
    })

    expect(next).toBe(state)
    expect(next.foldersById['folder-duplicate']).toBeUndefined()
  })

  it('renames a file and blocks rename to duplicate in same folder', () => {
    const withFile = createStateWithNestedTree()

    const withSecondFile = createFile(withFile, {
      parentFolderId: 'folder-a',
      fileId: 'file-c',
      fileName: 'Contract.pdf',
      size: 200,
      mimeType: 'application/pdf',
      now: NOW + 10,
    })

    const renamed = renameFile(withSecondFile, {
      fileId: 'file-c',
      fileName: 'Contract-v2.pdf',
      now: NOW + 11,
    })

    expect(renamed.filesById['file-c'].name).toBe('Contract-v2.pdf')

    const duplicateRenameAttempt = renameFile(renamed, {
      fileId: 'file-c',
      fileName: ' q1.pdf ',
      now: NOW + 12,
    })

    expect(duplicateRenameAttempt).toBe(renamed)
    expect(duplicateRenameAttempt.filesById['file-c'].name).toBe('Contract-v2.pdf')
  })

  it('treats rename to same normalized folder name as no-op', () => {
    const state = createStateWithNestedTree()

    const next = renameFolder(state, {
      folderId: 'folder-a',
      folderName: '  FINANCE  ',
      now: NOW + 20,
    })

    expect(next).toBe(state)
  })

  it('deletes nested folder descendants and files in one cascade', () => {
    const state = createStateWithNestedTree()

    const result = deleteFolderCascade(state, {
      folderId: 'folder-a',
      now: NOW + 30,
    })

    expect(result.deleted).toBe(true)
    expect(result.deletedFolderCount).toBe(2)
    expect(result.deletedFileCount).toBe(2)
    expect(result.fallbackFolderId).toBe(state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId)
    expect(result.nextState.foldersById['folder-a']).toBeUndefined()
    expect(result.nextState.foldersById['folder-a-1']).toBeUndefined()
    expect(result.nextState.filesById['file-a']).toBeUndefined()
    expect(result.nextState.filesById['file-b']).toBeUndefined()
  })

  it('returns no-op delete result when trying to delete root folder', () => {
    const state = createStateWithNestedTree()
    const rootFolderId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    const result = deleteFolderCascade(state, {
      folderId: rootFolderId,
      now: NOW + 31,
    })

    expect(result.deleted).toBe(false)
    expect(result.deletedFolderCount).toBe(0)
    expect(result.deletedFileCount).toBe(0)
    expect(result.fallbackFolderId).toBeNull()
    expect(result.nextState).toBe(state)
  })

  it('moves folders across parents and blocks invalid descendant moves', () => {
    const state = createStateWithNestedTree()

    const moved = moveFolder(state, {
      folderId: 'folder-a-1',
      destinationFolderId: 'folder-b',
      now: NOW + 40,
    })

    expect(moved.foldersById['folder-a'].childFolderIds).not.toContain('folder-a-1')
    expect(moved.foldersById['folder-b'].childFolderIds).toContain('folder-a-1')
    expect(moved.foldersById['folder-a-1'].parentFolderId).toBe('folder-b')

    const blocked = moveFolder(state, {
      folderId: 'folder-a',
      destinationFolderId: 'folder-a-1',
      now: NOW + 41,
    })

    expect(blocked).toBe(state)
  })

  it('blocks moving folder when destination has a normalized duplicate sibling name', () => {
    const state = createStateWithNestedTree()
    const withDestinationConflict = createFolder(state, {
      dataRoomId: state.dataRoomOrder[0],
      parentFolderId: 'folder-b',
      folderId: 'folder-b-finance',
      folderName: ' FINANCE ',
      now: NOW + 41,
    })

    const blocked = moveFolder(withDestinationConflict, {
      folderId: 'folder-a',
      destinationFolderId: 'folder-b',
      now: NOW + 42,
    })

    expect(blocked).toBe(withDestinationConflict)
    expect(blocked.foldersById['folder-a'].parentFolderId).toBe(
      state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId,
    )
  })

  it('treats moving folder to current parent as no-op', () => {
    const state = createStateWithNestedTree()

    const next = moveFolder(state, {
      folderId: 'folder-a-1',
      destinationFolderId: 'folder-a',
      now: NOW + 42,
    })

    expect(next).toBe(state)
  })

  it('blocks moving root folder and moving across data rooms', () => {
    const state = createStateWithNestedTree()
    const rootFolderId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    const blockedRootMove = moveFolder(state, {
      folderId: rootFolderId,
      destinationFolderId: 'folder-a',
      now: NOW + 43,
    })

    expect(blockedRootMove).toBe(state)

    const withSecondRoom = createDataRoom(state, {
      dataRoomId: 'dataroom-2',
      rootFolderId: 'root-2',
      dataRoomName: 'Room 2',
      rootFolderName: 'Root 2',
      now: NOW + 44,
    })

    const withSecondRoomFolder = createFolder(withSecondRoom, {
      dataRoomId: 'dataroom-2',
      parentFolderId: 'root-2',
      folderId: 'folder-r2-a',
      folderName: 'Cross destination',
      now: NOW + 45,
    })

    const blockedCrossRoomMove = moveFolder(withSecondRoomFolder, {
      folderId: 'folder-a-1',
      destinationFolderId: 'folder-r2-a',
      now: NOW + 46,
    })

    expect(blockedCrossRoomMove).toBe(withSecondRoomFolder)
  })

  it('normalizes stale parent references when moving folders', () => {
    const state = createStateWithNestedTree()
    const withStaleParentRefs = {
      ...state,
      foldersById: {
        ...state.foldersById,
        'folder-b': {
          ...state.foldersById['folder-b'],
          childFolderIds: [...state.foldersById['folder-b'].childFolderIds, 'folder-a-1'],
        },
      },
    }

    const moved = moveFolder(withStaleParentRefs, {
      folderId: 'folder-a-1',
      destinationFolderId: 'folder-b',
      now: NOW + 47,
    })

    const parentRefs = Object.values(moved.foldersById).filter((folder) => folder.childFolderIds.includes('folder-a-1'))
    expect(parentRefs).toHaveLength(1)
    expect(parentRefs[0]?.id).toBe('folder-b')
    expect(parentRefs[0]?.childFolderIds.filter((id) => id === 'folder-a-1')).toHaveLength(1)
    expect(moved.foldersById['folder-a-1'].parentFolderId).toBe('folder-b')
  })

  it('moves files across folders and blocks duplicate conflicts', () => {
    const state = createStateWithNestedTree()

    const moved = moveFile(state, {
      fileId: 'file-a',
      destinationFolderId: 'folder-b',
      now: NOW + 50,
    })

    expect(moved.filesById['file-a'].parentFolderId).toBe('folder-b')
    expect(moved.foldersById['folder-a'].fileIds).not.toContain('file-a')
    expect(moved.foldersById['folder-b'].fileIds).toContain('file-a')

    const withConflict = createFile(state, {
      parentFolderId: 'folder-b',
      fileId: 'file-conflict',
      fileName: 'Q1.pdf',
      size: 99,
      mimeType: 'application/pdf',
      now: NOW + 51,
    })

    const blocked = moveFile(withConflict, {
      fileId: 'file-a',
      destinationFolderId: 'folder-b',
      now: NOW + 52,
    })

    expect(blocked).toBe(withConflict)
  })
})

describe('delete analysis', () => {
  it('returns no-op summary for root and full descendant analysis for nested folder', () => {
    const state = createStateWithNestedTree()
    const rootFolderId = state.dataRoomsById[state.dataRoomOrder[0]].rootFolderId

    expect(getFolderDeleteSummary(state, rootFolderId)).toEqual({ folderCount: 0, fileCount: 0 })
    expect(getFileIdsForFolderCascadeDelete(state, rootFolderId)).toEqual([])

    expect(getFolderDeleteSummary(state, 'folder-a')).toEqual({ folderCount: 2, fileCount: 2 })
    expect(getFileIdsForFolderCascadeDelete(state, 'folder-a').sort()).toEqual(['file-a', 'file-b'])
  })
})

describe('sorting', () => {
  const items: FolderContentItem[] = [
    {
      kind: 'file',
      id: 'file-2',
      name: 'Bravo.pdf',
      updatedAt: 3,
      file: {
        id: 'file-2',
        name: 'Bravo.pdf',
        parentFolderId: 'root',
        mimeType: 'application/pdf',
        size: 10,
        createdAt: 1,
        updatedAt: 3,
      },
    },
    {
      kind: 'folder',
      id: 'folder-1',
      name: 'alpha',
      updatedAt: 5,
      folder: {
        id: 'folder-1',
        name: 'alpha',
        dataRoomId: 'dr',
        parentFolderId: null,
        childFolderIds: [],
        fileIds: [],
        createdAt: 1,
        updatedAt: 5,
      },
    },
    {
      kind: 'file',
      id: 'file-1',
      name: 'alpha.pdf',
      updatedAt: 1,
      file: {
        id: 'file-1',
        name: 'alpha.pdf',
        parentFolderId: 'root',
        mimeType: 'application/pdf',
        size: 10,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]

  it('sorts by type with folders first, then by name', () => {
    const sorted = sortContentItems(items, { field: 'type', direction: 'asc' })
    expect(sorted.map((item) => item.id)).toEqual(['folder-1', 'file-1', 'file-2'])
  })

  it('sorts by updated date and remains deterministic for equal timestamps', () => {
    const tieItems: FolderContentItem[] = [
      { ...items[0], updatedAt: 10, name: 'b.pdf' },
      { ...items[2], updatedAt: 10, name: 'a.pdf' },
    ]

    const sorted = sortContentItems(tieItems, { field: 'updated', direction: 'asc' })
    expect(sorted.map((item) => item.name)).toEqual(['a.pdf', 'b.pdf'])
  })

  it('uses reverse name tie-breaker for updated desc when timestamps are equal', () => {
    const tieItems: FolderContentItem[] = [
      { ...items[0], updatedAt: 10, name: 'b.pdf' },
      { ...items[2], updatedAt: 10, name: 'a.pdf' },
    ]

    const sorted = sortContentItems(tieItems, { field: 'updated', direction: 'desc' })
    expect(sorted.map((item) => item.name)).toEqual(['b.pdf', 'a.pdf'])
  })

  it('toggles sort direction when selecting the same field and resets on new field', () => {
    expect(getNextSortState({ field: 'name', direction: 'asc' }, 'name')).toEqual({
      field: 'name',
      direction: 'desc',
    })

    expect(getNextSortState({ field: 'updated', direction: 'desc' }, 'type')).toEqual({
      field: 'type',
      direction: 'asc',
    })
  })
})
