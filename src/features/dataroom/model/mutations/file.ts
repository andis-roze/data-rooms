import { getFileNameValidationError, hasDuplicateFileName, normalizeNodeName } from '../nameValidation'
import type { DataRoomState, FileNode } from '../types'
import { omitFilesById, withUpdatedDataRoomTimestamp } from './shared'
import type { CreateFileInput, DeleteFileInput, MoveFileInput, RenameFileInput } from './types'

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
    dataRoomsById: withUpdatedDataRoomTimestamp(state, parent.dataRoomId, now),
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
    dataRoomsById: withUpdatedDataRoomTimestamp(state, parent.dataRoomId, now),
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

  const nextFilesById = omitFilesById(state.filesById, [fileId])

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
    dataRoomsById: withUpdatedDataRoomTimestamp(state, parent.dataRoomId, now),
  }
}

export function moveFile(state: DataRoomState, input: MoveFileInput): DataRoomState {
  const { fileId, destinationFolderId, now } = input
  const file = state.filesById[fileId]
  const destinationFolder = state.foldersById[destinationFolderId]

  if (!file || !destinationFolder || file.parentFolderId === destinationFolder.id) {
    return state
  }

  const sourceParent = state.foldersById[file.parentFolderId]
  if (!sourceParent) {
    return state
  }

  if (sourceParent.dataRoomId !== destinationFolder.dataRoomId) {
    return state
  }

  if (hasDuplicateFileName(state, destinationFolder.id, file.name, file.id)) {
    return state
  }

  return {
    ...state,
    filesById: {
      ...state.filesById,
      [file.id]: {
        ...file,
        parentFolderId: destinationFolder.id,
        updatedAt: now,
      },
    },
    foldersById: {
      ...state.foldersById,
      [sourceParent.id]: {
        ...sourceParent,
        fileIds: sourceParent.fileIds.filter((id) => id !== file.id),
        updatedAt: now,
      },
      [destinationFolder.id]: {
        ...destinationFolder,
        fileIds: [...destinationFolder.fileIds, file.id],
        updatedAt: now,
      },
    },
    dataRoomsById: withUpdatedDataRoomTimestamp(state, sourceParent.dataRoomId, now),
  }
}
