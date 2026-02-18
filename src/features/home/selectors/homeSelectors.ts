import type { DataRoom, DataRoomState, Folder, NodeId } from '../../dataroom/model'
import type { FolderContentItem, SortState } from '../model/homeViewTypes'
import { sortContentItems } from './homeSorting'
import { buildFolderPath, getFileChildren, getFolderChildren, isDefined } from './homeTree'

// Home-page focused selectors to keep view derivation out of UI components/controllers.
export function selectDataRooms(entities: DataRoomState): DataRoom[] {
  return entities.dataRoomOrder.map((id) => entities.dataRoomsById[id]).filter(isDefined)
}

export function selectActiveDataRoom(
  entities: DataRoomState,
  selectedDataRoomId: NodeId | null,
  dataRooms: DataRoom[],
): DataRoom | undefined {
  return (selectedDataRoomId ? entities.dataRoomsById[selectedDataRoomId] : undefined) ?? dataRooms[0]
}

export function selectRootFolder(entities: DataRoomState, activeDataRoom: DataRoom | undefined): Folder | null {
  return activeDataRoom ? entities.foldersById[activeDataRoom.rootFolderId] : null
}

export function selectActiveFolder(
  entities: DataRoomState,
  rootFolder: Folder | null,
  selectedFolderId: NodeId | null,
): Folder | null {
  return rootFolder ? ((selectedFolderId ? entities.foldersById[selectedFolderId] : undefined) ?? rootFolder) : null
}

export function selectBreadcrumbs(entities: DataRoomState, activeFolder: Folder | null): Folder[] {
  return activeFolder ? buildFolderPath(entities, activeFolder.id) : []
}

export function selectVisibleContentItems(
  entities: DataRoomState,
  activeFolder: Folder | null,
  resolveDisplayName: (value: string) => string,
  sortState: SortState,
): FolderContentItem[] {
  if (!activeFolder) {
    return []
  }

  const childFolders = getFolderChildren(entities, activeFolder)
  const childFiles = getFileChildren(entities, activeFolder)
  const parentFolder = activeFolder.parentFolderId ? entities.foldersById[activeFolder.parentFolderId] : undefined

  const parentFolderNavigationItems: FolderContentItem[] = parentFolder
    ? [
        {
          kind: 'folder',
          id: `parent-${parentFolder.id}`,
          name: resolveDisplayName(parentFolder.name),
          displayName: '..',
          updatedAt: parentFolder.updatedAt,
          folder: parentFolder,
          isParentNavigation: true,
        },
      ]
    : []

  const childContentItems: FolderContentItem[] = [
    ...childFolders.map((folder) => ({
      kind: 'folder' as const,
      id: folder.id,
      name: folder.name,
      updatedAt: folder.updatedAt,
      folder,
    })),
    ...childFiles.map((file) => ({
      kind: 'file' as const,
      id: file.id,
      name: file.name,
      updatedAt: file.updatedAt,
      file,
    })),
  ]

  return [...parentFolderNavigationItems, ...sortContentItems(childContentItems, sortState)]
}
