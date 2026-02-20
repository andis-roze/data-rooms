import {
  getDataRoomNameValidationError,
  getFileNameValidationError,
  getFolderNameValidationError,
  hasDuplicateDataRoomName,
  hasDuplicateFileName,
  hasDuplicateFolderName,
  normalizeNodeName,
} from './nameValidation'
import { collectFolderAndFileIds } from './treeDeleteTargets'
import type { DataRoomState, FileNode, Folder, NodeId, UnixMs } from './types'

// Pure immutable mutation helpers for data room, folder, and file tree operations.
export interface CreateDataRoomInput {
  dataRoomId: NodeId
  rootFolderId: NodeId
  dataRoomName: string
  rootFolderName: string
  now: UnixMs
}

export interface RenameDataRoomInput {
  dataRoomId: NodeId
  dataRoomName: string
  now: UnixMs
}

export interface DeleteDataRoomInput {
  dataRoomId: NodeId
}

export interface DeleteDataRoomResult {
  nextState: DataRoomState
  deleted: boolean
  fallbackDataRoomId: NodeId | null
}

function createDeleteDataRoomNoopResult(state: DataRoomState): DeleteDataRoomResult {
  return {
    nextState: state,
    deleted: false,
    fallbackDataRoomId: null,
  }
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

function createDeleteFolderCascadeNoopResult(state: DataRoomState): DeleteFolderCascadeResult {
  return {
    nextState: state,
    deleted: false,
    fallbackFolderId: null,
    deletedFolderCount: 0,
    deletedFileCount: 0,
  }
}

export interface CreateFileInput {
  parentFolderId: NodeId
  fileId: NodeId
  fileName: string
  size: number
  mimeType: 'application/pdf'
  now: UnixMs
}

export interface RenameFileInput {
  fileId: NodeId
  fileName: string
  now: UnixMs
}

export interface DeleteFileInput {
  fileId: NodeId
  now: UnixMs
}

export function createDataRoom(state: DataRoomState, input: CreateDataRoomInput): DataRoomState {
  const { dataRoomId, rootFolderId, dataRoomName, rootFolderName, now } = input
  const dataRoomNameError = getDataRoomNameValidationError(dataRoomName)
  const rootFolderNameError = getFolderNameValidationError(rootFolderName)

  if (dataRoomNameError || rootFolderNameError) {
    return state
  }

  if (hasDuplicateDataRoomName(state, dataRoomName)) {
    return state
  }

  if (state.dataRoomsById[dataRoomId] || state.foldersById[rootFolderId]) {
    return state
  }

  return {
    ...state,
    dataRoomOrder: [...state.dataRoomOrder, dataRoomId],
    dataRoomsById: {
      ...state.dataRoomsById,
      [dataRoomId]: {
        id: dataRoomId,
        name: dataRoomName.trim(),
        rootFolderId,
        createdAt: now,
        updatedAt: now,
      },
    },
    foldersById: {
      ...state.foldersById,
      [rootFolderId]: {
        id: rootFolderId,
        dataRoomId,
        parentFolderId: null,
        name: rootFolderName.trim(),
        childFolderIds: [],
        fileIds: [],
        createdAt: now,
        updatedAt: now,
      },
    },
  }
}

export function renameDataRoom(state: DataRoomState, input: RenameDataRoomInput): DataRoomState {
  const { dataRoomId, dataRoomName, now } = input
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return state
  }

  const dataRoomNameError = getDataRoomNameValidationError(dataRoomName)
  const nextName = dataRoomName.trim()

  if (dataRoomNameError || normalizeNodeName(nextName) === normalizeNodeName(dataRoom.name)) {
    return state
  }

  if (hasDuplicateDataRoomName(state, nextName, dataRoomId)) {
    return state
  }

  return {
    ...state,
    dataRoomsById: {
      ...state.dataRoomsById,
      [dataRoomId]: {
        ...dataRoom,
        name: nextName,
        updatedAt: now,
      },
    },
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

  if (folderNameError || hasDuplicateFolderName(state, parentFolderId, folderName) || state.foldersById[folderId]) {
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
  const nextName = folderName.trim()

  if (folderNameError || normalizeNodeName(nextName) === normalizeNodeName(folder.name)) {
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

export function createFile(state: DataRoomState, input: CreateFileInput): DataRoomState {
  const { parentFolderId, fileId, fileName, size, mimeType, now } = input
  const parent = state.foldersById[parentFolderId]

  if (!parent) {
    return state
  }

  const fileNameError = getFileNameValidationError(fileName)

  if (fileNameError || state.filesById[fileId] || hasDuplicateFileName(state, parentFolderId, fileName)) {
    return state
  }

  const nextFile: FileNode = {
    id: fileId,
    parentFolderId,
    name: fileName.trim(),
    mimeType,
    size,
    createdAt: now,
    updatedAt: now,
  }

  return {
    ...state,
    filesById: {
      ...state.filesById,
      [fileId]: nextFile,
    },
    foldersById: {
      ...state.foldersById,
      [parentFolderId]: {
        ...parent,
        fileIds: [...parent.fileIds, fileId],
        updatedAt: now,
      },
    },
    dataRoomsById: {
      ...state.dataRoomsById,
      [parent.dataRoomId]: {
        ...state.dataRoomsById[parent.dataRoomId],
        updatedAt: now,
      },
    },
  }
}

export function renameFile(state: DataRoomState, input: RenameFileInput): DataRoomState {
  const { fileId, fileName, now } = input
  const file = state.filesById[fileId]

  if (!file) {
    return state
  }

  const fileNameError = getFileNameValidationError(fileName)
  const nextName = fileName.trim()

  if (fileNameError || normalizeNodeName(nextName) === normalizeNodeName(file.name)) {
    return state
  }

  if (hasDuplicateFileName(state, file.parentFolderId, nextName, fileId)) {
    return state
  }

  const parent = state.foldersById[file.parentFolderId]

  if (!parent) {
    return state
  }

  return {
    ...state,
    filesById: {
      ...state.filesById,
      [fileId]: {
        ...file,
        name: nextName,
        updatedAt: now,
      },
    },
    dataRoomsById: {
      ...state.dataRoomsById,
      [parent.dataRoomId]: {
        ...state.dataRoomsById[parent.dataRoomId],
        updatedAt: now,
      },
    },
  }
}

export function deleteFile(state: DataRoomState, input: DeleteFileInput): DataRoomState {
  const { fileId, now } = input
  const file = state.filesById[fileId]

  if (!file) {
    return state
  }

  const parent = state.foldersById[file.parentFolderId]

  if (!parent) {
    return state
  }

  const nextFilesById = { ...state.filesById }
  delete nextFilesById[fileId]

  return {
    ...state,
    filesById: nextFilesById,
    foldersById: {
      ...state.foldersById,
      [parent.id]: {
        ...parent,
        fileIds: parent.fileIds.filter((id) => id !== fileId),
        updatedAt: now,
      },
    },
    dataRoomsById: {
      ...state.dataRoomsById,
      [parent.dataRoomId]: {
        ...state.dataRoomsById[parent.dataRoomId],
        updatedAt: now,
      },
    },
  }
}

export function deleteFolderCascade(
  state: DataRoomState,
  input: DeleteFolderCascadeInput,
): DeleteFolderCascadeResult {
  const { folderId, now } = input
  const folder = state.foldersById[folderId]

  if (!folder) {
    return createDeleteFolderCascadeNoopResult(state)
  }

  const dataRoom = state.dataRoomsById[folder.dataRoomId]

  if (!dataRoom || dataRoom.rootFolderId === folderId || !folder.parentFolderId) {
    return createDeleteFolderCascadeNoopResult(state)
  }

  const parentFolder = state.foldersById[folder.parentFolderId]

  if (!parentFolder) {
    return createDeleteFolderCascadeNoopResult(state)
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

export function deleteDataRoom(state: DataRoomState, input: DeleteDataRoomInput): DeleteDataRoomResult {
  const { dataRoomId } = input
  const dataRoom = state.dataRoomsById[dataRoomId]

  if (!dataRoom) {
    return createDeleteDataRoomNoopResult(state)
  }

  const collectResult = collectFolderAndFileIds(state, dataRoom.rootFolderId)
  const nextDataRoomsById = { ...state.dataRoomsById }
  const nextFoldersById = { ...state.foldersById }
  const nextFilesById = { ...state.filesById }

  delete nextDataRoomsById[dataRoomId]

  collectResult.folderIds.forEach((id) => {
    delete nextFoldersById[id]
  })

  collectResult.fileIds.forEach((id) => {
    delete nextFilesById[id]
  })

  const nextDataRoomOrder = state.dataRoomOrder.filter((id) => id !== dataRoomId)

  return {
    nextState: {
      ...state,
      dataRoomOrder: nextDataRoomOrder,
      dataRoomsById: nextDataRoomsById,
      foldersById: nextFoldersById,
      filesById: nextFilesById,
    },
    deleted: true,
    fallbackDataRoomId: nextDataRoomOrder[0] ?? null,
  }
}
