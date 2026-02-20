import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createFolder, createSeedDataRoomState } from '../../features/dataroom/model'
import { useSidebarMoveConfirm } from '../../features/home/hooks/useSidebarMoveConfirm'
import { useSidebarTreeCollapse } from '../../features/home/hooks/useSidebarTreeCollapse'

const NOW = 1_700_000_000_000

describe('useSidebarTreeCollapse', () => {
  it('auto-collapses non-ancestor branches and supports manual toggle overrides', () => {
    const seeded = createSeedDataRoomState(NOW)
    const dataRoomId = seeded.dataRoomOrder[0]
    const rootFolderId = seeded.dataRoomsById[dataRoomId].rootFolderId

    const withFolderA = createFolder(seeded, {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: 'folder-a',
      folderName: 'A',
      now: NOW + 1,
    })

    const withFolderB = createFolder(withFolderA, {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: 'folder-b',
      folderName: 'B',
      now: NOW + 2,
    })

    const withNestedInA = createFolder(withFolderB, {
      dataRoomId,
      parentFolderId: 'folder-a',
      folderId: 'folder-a-1',
      folderName: 'A1',
      now: NOW + 3,
    })

    const withNestedInB = createFolder(withNestedInA, {
      dataRoomId,
      parentFolderId: 'folder-b',
      folderId: 'folder-b-1',
      folderName: 'B1',
      now: NOW + 4,
    })

    const { result } = renderHook(() =>
      useSidebarTreeCollapse({
        entities: withNestedInB,
        selectedDataRoomId: dataRoomId,
        selectedFolderId: 'folder-a-1',
      }),
    )

    expect(result.current.collapsedNodeIds.has('folder-b')).toBe(true)

    act(() => {
      result.current.toggleNode('folder-b')
    })

    expect(result.current.collapsedNodeIds.has('folder-b')).toBe(false)
  })
})

describe('useSidebarMoveConfirm', () => {
  it('opens and confirms move for selected items when destination is valid', () => {
    const seeded = createSeedDataRoomState(NOW)
    const moveItemsToFolder = vi.fn()

    const { result } = renderHook(() =>
      useSidebarMoveConfirm({
        entities: seeded,
        selectedContentItemIds: ['file-1', 'file-2'],
        dragMoveItemIds: [],
        onCanDropOnFolder: () => true,
        onMoveItemsToFolder: moveItemsToFolder,
      }),
    )

    act(() => {
      result.current.openMoveConfirmDialog('seed-folder')
    })

    expect(result.current.moveConfirmState.open).toBe(true)
    expect(result.current.moveConfirmState.itemIds).toEqual(['file-1', 'file-2'])

    act(() => {
      result.current.confirmMove()
    })

    expect(moveItemsToFolder).toHaveBeenCalledWith(['file-1', 'file-2'], 'seed-folder')
    expect(result.current.moveConfirmState.open).toBe(false)
  })

  it('skips opening when destination cannot accept drop', () => {
    const seeded = createSeedDataRoomState(NOW)

    const { result } = renderHook(() =>
      useSidebarMoveConfirm({
        entities: seeded,
        selectedContentItemIds: ['file-1'],
        dragMoveItemIds: [],
        onCanDropOnFolder: () => false,
        onMoveItemsToFolder: vi.fn(),
      }),
    )

    act(() => {
      result.current.openMoveConfirmDialog('seed-folder')
    })

    expect(result.current.moveConfirmState.open).toBe(false)
  })
})
