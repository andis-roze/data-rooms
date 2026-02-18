import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDataRoomDeleteSummary,
  getFolderDeleteSummary,
  normalizeNodeName,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'
import type { FeedbackState, FolderContentItem, SortState } from './types'
import {
  buildFolderPath,
  getFileChildren,
  getFolderChildren,
  isDefined,
  loadSortModePreference,
} from './utils'
import { useHomePageHandlers } from './useHomePageHandlers'

export function useHomePageController() {
  const { t, i18n } = useTranslation()
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const feedbackIdRef = useRef(0)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDataRoomDialogOpen, setCreateDataRoomDialogOpen] = useState(false)
  const [renameDataRoomDialogOpen, setRenameDataRoomDialogOpen] = useState(false)
  const [deleteDataRoomDialogOpen, setDeleteDataRoomDialogOpen] = useState(false)

  const [renameFileDialogOpen, setRenameFileDialogOpen] = useState(false)
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false)
  const [viewFileDialogOpen, setViewFileDialogOpen] = useState(false)
  const [targetFolderId, setTargetFolderId] = useState<NodeId | null>(null)

  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)
  const [dataRoomNameDraft, setDataRoomNameDraft] = useState('')
  const [dataRoomNameError, setDataRoomNameError] = useState<string | null>(null)

  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<NodeId | null>(null)

  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackState[]>([])
  const [sortState, setSortState] = useState<SortState>(() => loadSortModePreference())

  const resolveDisplayName = (value: string) =>
    value.startsWith('i18n:') ? t(value.slice(5)) : value

  const enqueueFeedback = (message: string, severity: FeedbackState['severity']) => {
    setFeedbackQueue((previous) => [...previous, { id: feedbackIdRef.current++, message, severity }])
  }

  const dismissFeedback = (id: number) => {
    setFeedbackQueue((previous) => previous.filter((item) => item.id !== id))
  }

  const hasDuplicateDataRoomDisplayName = (candidateName: string, excludeDataRoomId?: NodeId) => {
    const normalizedCandidate = normalizeNodeName(candidateName)

    return entities.dataRoomOrder.some((dataRoomId) => {
      if (excludeDataRoomId && dataRoomId === excludeDataRoomId) {
        return false
      }

      const dataRoom = entities.dataRoomsById[dataRoomId]

      if (!dataRoom) {
        return false
      }

      return normalizeNodeName(resolveDisplayName(dataRoom.name)) === normalizedCandidate
    })
  }

  const dataRooms = entities.dataRoomOrder.map((id) => entities.dataRoomsById[id]).filter(isDefined)
  const activeDataRoom =
    (selectedDataRoomId ? entities.dataRoomsById[selectedDataRoomId] : undefined) ?? dataRooms[0]
  const rootFolder = activeDataRoom ? entities.foldersById[activeDataRoom.rootFolderId] : null
  const canDeleteActiveDataRoom = Boolean(activeDataRoom)
  const dataRoomDeleteSummary = activeDataRoom
    ? getDataRoomDeleteSummary(entities, activeDataRoom.id)
    : { folderCount: 0, fileCount: 0 }

  const activeFolder =
    rootFolder ? ((selectedFolderId ? entities.foldersById[selectedFolderId] : undefined) ?? rootFolder) : null
  const breadcrumbs = activeFolder ? buildFolderPath(entities, activeFolder.id) : []
  const childFolders = activeFolder ? getFolderChildren(entities, activeFolder) : []
  const childFiles = activeFolder ? getFileChildren(entities, activeFolder) : []
  const parentFolder =
    activeFolder?.parentFolderId ? entities.foldersById[activeFolder.parentFolderId] : undefined

  const parentNavigationItem: FolderContentItem[] = parentFolder
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

  const contentItems: FolderContentItem[] = [
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

  const sortedContentItems = [...contentItems].sort((a, b) => {
    const compareName = () => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    const directionMultiplier = sortState.direction === 'asc' ? 1 : -1

    if (sortState.field === 'type') {
      if (a.kind !== b.kind) {
        return (a.kind === 'folder' ? -1 : 1) * directionMultiplier
      }

      return compareName() * directionMultiplier
    }

    if (sortState.field === 'name') {
      return compareName() * directionMultiplier
    }

    if (a.updatedAt === b.updatedAt) {
      return compareName() * directionMultiplier
    }

    return (a.updatedAt - b.updatedAt) * directionMultiplier
  })

  const visibleContentItems = [...parentNavigationItem, ...sortedContentItems]
  const locale = i18n.resolvedLanguage ?? i18n.language

  const targetFolder = targetFolderId ? entities.foldersById[targetFolderId] : null
  const deleteSummary = activeFolder
    ? getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
    : { folderCount: 0, fileCount: 0 }
  const activeFile = activeFileId ? entities.filesById[activeFileId] : null

  const handlers = useHomePageHandlers({
    t,
    entities,
    dispatch,
    activeDataRoom,
    activeFolder,
    targetFolder,
    activeFile,
    dataRoomNameDraft,
    folderNameDraft,
    fileNameDraft,
    sortState,
    resolveDisplayName,
    hasDuplicateDataRoomDisplayName,
    enqueueFeedback,
    setSortState,
    setCreateDataRoomDialogOpen,
    setRenameDataRoomDialogOpen,
    setDeleteDataRoomDialogOpen,
    setCreateDialogOpen,
    setRenameDialogOpen,
    setDeleteDialogOpen,
    setRenameFileDialogOpen,
    setDeleteFileDialogOpen,
    setViewFileDialogOpen,
    setTargetFolderId,
    setActiveFileId,
    setFolderNameDraft,
    setFolderNameError,
    setDataRoomNameDraft,
    setDataRoomNameError,
    setFileNameDraft,
    setFileNameError,
  })

  return {
    t,
    entities,
    selectedDataRoomId,
    selectedFolderId,
    dispatch,
    uploadInputRef,
    dataRooms,
    activeDataRoom,
    rootFolder,
    activeFolder,
    breadcrumbs,
    visibleContentItems,
    locale,
    targetFolder,
    activeFile,
    deleteSummary,
    canDeleteActiveDataRoom,
    dataRoomDeleteSummary,
    feedbackQueue,
    sortState,
    resolveDisplayName,
    dismissFeedback,
    createDataRoomDialogOpen,
    renameDataRoomDialogOpen,
    deleteDataRoomDialogOpen,
    createDialogOpen,
    renameDialogOpen,
    deleteDialogOpen,
    renameFileDialogOpen,
    deleteFileDialogOpen,
    viewFileDialogOpen,
    dataRoomNameDraft,
    dataRoomNameError,
    folderNameDraft,
    folderNameError,
    fileNameDraft,
    fileNameError,
    setCreateDataRoomDialogOpen,
    setRenameDataRoomDialogOpen,
    setDeleteDataRoomDialogOpen,
    setCreateDialogOpen,
    setRenameFileDialogOpen,
    setDeleteFileDialogOpen,
    setViewFileDialogOpen,
    setDataRoomNameDraft,
    setDataRoomNameError,
    setFolderNameDraft,
    setFolderNameError,
    setFileNameDraft,
    setFileNameError,
    ...handlers,
  }
}
