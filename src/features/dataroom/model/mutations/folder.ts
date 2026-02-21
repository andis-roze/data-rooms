import { getFolderNameValidationError, hasDuplicateFolderName, normalizeNodeName } from '../nameValidation'
import { collectFolderAndFileIds } from '../treeDeleteTargets'
import type { DataRoomState, Folder } from '../types'
import {
  createDeleteFolderCascadeNoopResult,
  isDescendantFolder,
  omitFilesById,
  omitFoldersById,
  withUpdatedDataRoomTimestamp,
} from './shared'
import type {
  CreateFolderInput,
  DeleteFolderCascadeInput,
  DeleteFolderCascadeResult,
  MoveFolderInput,
  RenameFolderInput,
} from './types'

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
    dataRoomsById: withUpdatedDataRoomTimestamp(state, dataRoomId, now),
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
    dataRoomsById: withUpdatedDataRoomTimestamp(state, folder.dataRoomId, now),
  }
}

export function moveFolder(state: DataRoomState, input: MoveFolderInput): DataRoomState {
  const { folderId, destinationFolderId, now } = input
  const folder = state.foldersById[folderId]
  const destinationFolder = state.foldersById[destinationFolderId]

  if (!folder || !destinationFolder || !folder.parentFolderId) {
    return state
  }

  if (folder.id === destinationFolder.id || folder.parentFolderId === destinationFolder.id) {
    return state
  }

  if (folder.dataRoomId !== destinationFolder.dataRoomId) {
    return state
  }

  if (isDescendantFolder(state, destinationFolder.id, folder.id)) {
    return state
  }

  if (hasDuplicateFolderName(state, destinationFolder.id, folder.name, folder.id)) {
    return state
  }

  if (!state.foldersById[folder.parentFolderId]) {
    return state
  }

  // Defensive normalization: ensure the folder is detached from any previous parent references
  // before attaching it to the destination. This avoids duplicate tree entries if stale state
  // already contains the folder id in multiple parent lists.
  const normalizedFoldersById = { ...state.foldersById }
  for (const currentFolder of Object.values(state.foldersById)) {
    if (!currentFolder.childFolderIds.includes(folder.id)) {
      continue
    }
    normalizedFoldersById[currentFolder.id] = {
      ...currentFolder,
      childFolderIds: currentFolder.childFolderIds.filter((id) => id !== folder.id),
      updatedAt: now,
    }
  }

  const destinationChildren = normalizedFoldersById[destinationFolder.id]?.childFolderIds ?? []

  return {
    ...state,
    foldersById: {
      ...normalizedFoldersById,
      [destinationFolder.id]: {
        ...destinationFolder,
        childFolderIds: destinationChildren.includes(folder.id) ? destinationChildren : [...destinationChildren, folder.id],
        updatedAt: now,
      },
      [folder.id]: {
        ...folder,
        parentFolderId: destinationFolder.id,
        updatedAt: now,
      },
    },
    dataRoomsById: withUpdatedDataRoomTimestamp(state, folder.dataRoomId, now),
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
  const nextFoldersById = omitFoldersById(state.foldersById, collectResult.folderIds)
  const nextFilesById = omitFilesById(state.filesById, collectResult.fileIds)

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
      dataRoomsById: withUpdatedDataRoomTimestamp(state, folder.dataRoomId, now),
    },
    deleted: true,
    fallbackFolderId: parentFolder.id,
    deletedFolderCount: collectResult.folderCount,
    deletedFileCount: collectResult.fileCount,
  }
}
