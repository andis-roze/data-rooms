import { getFolderNameValidationError, hasDuplicateFolderName, normalizeNodeName } from './nameValidation'
import type { DataRoomState, Folder, NodeId, UnixMs } from './types'

export interface DataRoomSelection {
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
}

export interface CreateFolderInput {
  dataRoomId: NodeId
  parentFolderId: NodeId
  folderId: NodeId
  folderName: string
  now: UnixMs
}

export interface RenameFolderInput {
  folderId: NodeId
  folderName: string
  now: UnixMs
}

export interface DeleteFolderCascadeInput {
  folderId: NodeId
  now: UnixMs
}

export interface DeleteFolderCascadeResult {
  nextState: DataRoomState
  deleted: boolean
  fallbackFolderId: NodeId | null
  deletedFolderCount: number
  deletedFileCount: number
}

export interface FolderDeleteSummary {
  folderCount: number
  fileCount: number
}

export function getDefaultSelection(state: DataRoomState): DataRoomSelection {
  const selectedDataRoomId = state.dataRoomOrder[0] ?? null

  if (!selectedDataRoomId) {
    return {
      selectedDataRoomId: null,
      selectedFolderId: null,
    }
  }

  const dataRoom = state.dataRoomsById[selectedDataRoomId]

  if (!dataRoom) {
    return {
      selectedDataRoomId: null,
      selectedFolderId: null,
    }
  }

  return {
    selectedDataRoomId,
    selectedFolderId: dataRoom.rootFolderId,
  }
}

export function hasDataRoom(state: DataRoomState, dataRoomId: NodeId): boolean {
  return Boolean(state.dataRoomsById[dataRoomId])
}

export function hasFolder(state: DataRoomState, folderId: NodeId): boolean {
  return Boolean(state.foldersById[folderId])
}

export function resolveSelection(
  state: DataRoomState,
  selectedDataRoomId: NodeId | null,
  selectedFolderId: NodeId | null,
): DataRoomSelection {
  if (!selectedDataRoomId || !hasDataRoom(state, selectedDataRoomId)) {
    return getDefaultSelection(state)
  }

  const dataRoom = state.dataRoomsById[selectedDataRoomId]

  if (!selectedFolderId || !hasFolder(state, selectedFolderId)) {
    return {
      selectedDataRoomId,
      selectedFolderId: dataRoom.rootFolderId,
    }
  }

  const selectedFolder = state.foldersById[selectedFolderId]

  if (selectedFolder.dataRoomId !== selectedDataRoomId) {
    return {
      selectedDataRoomId,
      selectedFolderId: dataRoom.rootFolderId,
    }
  }

  return {
    selectedDataRoomId,
    selectedFolderId,
  }
}

export function createFolder(state: DataRoomState, input: CreateFolderInput): DataRoomState {
  const { dataRoomId, parentFolderId, folderId, folderName, now } = input
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return state
  }

  const parent = state.foldersById[parentFolderId]

  if (!parent || parent.dataRoomId !== dataRoomId) {
    return state
  }

  const folderNameError = getFolderNameValidationError(folderName)

  if (folderNameError) {
    return state
  }

  if (hasDuplicateFolderName(state, parentFolderId, folderName)) {
    return state
  }

  if (state.foldersById[folderId]) {
    return state
  }

  const nextFolder: Folder = {
    id: folderId,
    dataRoomId,
    parentFolderId,
    name: folderName.trim(),
    childFolderIds: [],
    fileIds: [],
    createdAt: now,
    updatedAt: now,
  }

  return {
    ...state,
    dataRoomsById: {
      ...state.dataRoomsById,
      [dataRoomId]: {
        ...dataRoom,
        updatedAt: now,
      },
    },
    foldersById: {
      ...state.foldersById,
      [parentFolderId]: {
        ...parent,
        childFolderIds: [...parent.childFolderIds, folderId],
        updatedAt: now,
      },
      [folderId]: nextFolder,
    },
  }
}

export function renameFolder(state: DataRoomState, input: RenameFolderInput): DataRoomState {
  const { folderId, folderName, now } = input
  const folder = state.foldersById[folderId]

  if (!folder) {
    return state
  }

  const folderNameError = getFolderNameValidationError(folderName)

  if (folderNameError) {
    return state
  }

  const nextName = folderName.trim()

  if (normalizeNodeName(nextName) === normalizeNodeName(folder.name)) {
    return state
  }

  if (hasDuplicateFolderName(state, folder.parentFolderId, nextName, folderId)) {
    return state
  }

  return {
    ...state,
    foldersById: {
      ...state.foldersById,
      [folderId]: {
        ...folder,
        name: nextName,
        updatedAt: now,
      },
    },
    dataRoomsById: {
      ...state.dataRoomsById,
      [folder.dataRoomId]: {
        ...state.dataRoomsById[folder.dataRoomId],
        updatedAt: now,
      },
    },
  }
}

function collectFolderAndFileIds(state: DataRoomState, rootFolderId: NodeId): FolderDeleteSummary & { folderIds: Set<NodeId>; fileIds: Set<NodeId> } {
  const folderIds = new Set<NodeId>()
  const fileIds = new Set<NodeId>()
  const stack: NodeId[] = [rootFolderId]

  while (stack.length > 0) {
    const currentId = stack.pop()

    if (!currentId || folderIds.has(currentId)) {
      continue
    }

    const currentFolder = state.foldersById[currentId]

    if (!currentFolder) {
      continue
    }

    folderIds.add(currentId)

    currentFolder.fileIds.forEach((fileId) => {
      fileIds.add(fileId)
    })

    currentFolder.childFolderIds.forEach((childFolderId) => {
      if (!folderIds.has(childFolderId)) {
        stack.push(childFolderId)
      }
    })
  }

  return {
    folderIds,
    fileIds,
    folderCount: folderIds.size,
    fileCount: fileIds.size,
  }
}

export function getFolderDeleteSummary(state: DataRoomState, folderId: NodeId): FolderDeleteSummary {
  const folder = state.foldersById[folderId]

  if (!folder) {
    return { folderCount: 0, fileCount: 0 }
  }

  const dataRoom = state.dataRoomsById[folder.dataRoomId]

  if (!dataRoom || dataRoom.rootFolderId === folderId) {
    return { folderCount: 0, fileCount: 0 }
  }

  const result = collectFolderAndFileIds(state, folderId)

  return {
    folderCount: result.folderCount,
    fileCount: result.fileCount,
  }
}

export function deleteFolderCascade(
  state: DataRoomState,
  input: DeleteFolderCascadeInput,
): DeleteFolderCascadeResult {
  const { folderId, now } = input
  const folder = state.foldersById[folderId]

  if (!folder) {
    return {
      nextState: state,
      deleted: false,
      fallbackFolderId: null,
      deletedFolderCount: 0,
      deletedFileCount: 0,
    }
  }

  const dataRoom = state.dataRoomsById[folder.dataRoomId]

  if (!dataRoom || dataRoom.rootFolderId === folderId || !folder.parentFolderId) {
    return {
      nextState: state,
      deleted: false,
      fallbackFolderId: null,
      deletedFolderCount: 0,
      deletedFileCount: 0,
    }
  }

  const parentFolder = state.foldersById[folder.parentFolderId]

  if (!parentFolder) {
    return {
      nextState: state,
      deleted: false,
      fallbackFolderId: null,
      deletedFolderCount: 0,
      deletedFileCount: 0,
    }
  }

  const collectResult = collectFolderAndFileIds(state, folderId)
  const nextFoldersById = { ...state.foldersById }
  const nextFilesById = { ...state.filesById }

  collectResult.folderIds.forEach((id) => {
    delete nextFoldersById[id]
  })

  collectResult.fileIds.forEach((id) => {
    delete nextFilesById[id]
  })

  nextFoldersById[parentFolder.id] = {
    ...parentFolder,
    childFolderIds: parentFolder.childFolderIds.filter((id) => id !== folderId),
    updatedAt: now,
  }

  return {
    nextState: {
      ...state,
      foldersById: nextFoldersById,
      filesById: nextFilesById,
      dataRoomsById: {
        ...state.dataRoomsById,
        [folder.dataRoomId]: {
          ...dataRoom,
          updatedAt: now,
        },
      },
    },
    deleted: true,
    fallbackFolderId: parentFolder.id,
    deletedFolderCount: collectResult.folderCount,
    deletedFileCount: collectResult.fileCount,
  }
}
