import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDataRoomDeleteSummary,
  getFolderDeleteSummary,
  normalizeNodeName,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'
import { selectActiveDataRoom, selectActiveFolder, selectBreadcrumbs, selectDataRooms, selectRootFolder, selectVisibleContentItems } from './selectors/homeSelectors'
import { loadSortModePreference } from './services/sortPreference'
import type { FeedbackState, SortState } from './types'
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
  const rawTranslate = i18n.t as unknown as (key: string, options?: Record<string, unknown>) => string
  const tr = (key: string, options?: Record<string, unknown>): string =>
    rawTranslate(key, options)

  const resolveDisplayName = (value: string) =>
    value.startsWith('i18n:') ? tr(value.slice(5)) : value

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

  const dataRooms = selectDataRooms(entities)
  const activeDataRoom = selectActiveDataRoom(entities, selectedDataRoomId, dataRooms)
  const rootFolder = selectRootFolder(entities, activeDataRoom)
  const canDeleteActiveDataRoom = Boolean(activeDataRoom)
  const dataRoomDeleteSummary = activeDataRoom
    ? getDataRoomDeleteSummary(entities, activeDataRoom.id)
    : { folderCount: 0, fileCount: 0 }

  const activeFolder = selectActiveFolder(entities, rootFolder, selectedFolderId)
  const breadcrumbs = selectBreadcrumbs(entities, activeFolder)
  const visibleContentItems = selectVisibleContentItems(entities, activeFolder, resolveDisplayName, sortState)
  const locale = i18n.resolvedLanguage ?? i18n.language

  const targetFolder = targetFolderId ? entities.foldersById[targetFolderId] : null
  const deleteSummary = activeFolder
    ? getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
    : { folderCount: 0, fileCount: 0 }
  const activeFile = activeFileId ? entities.filesById[activeFileId] : null

  const handlers = useHomePageHandlers({
    t: tr,
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
