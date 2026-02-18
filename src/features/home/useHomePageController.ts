import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDataRoomDeleteSummary,
  getFolderDeleteSummary,
  normalizeNodeName,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'
import {
  selectActiveDataRoom,
  selectActiveFolder,
  selectBreadcrumbs,
  selectDataRooms,
  selectRootFolder,
  selectVisibleContentItems,
} from './selectors/homeSelectors'
import { loadFeedbackTimeoutMs } from './services/feedback'
import { loadSortModePreference } from './services/sortPreference'
import type { FeedbackState, SortState } from './types'
import { useHomePageHandlers } from './useHomePageHandlers'

export function useHomePageController() {
  const { t, i18n } = useTranslation()
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const feedbackIdRef = useRef(0)

  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false)
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false)
  const [isCreateDataRoomDialogOpen, setIsCreateDataRoomDialogOpen] = useState(false)
  const [isRenameDataRoomDialogOpen, setIsRenameDataRoomDialogOpen] = useState(false)
  const [isDeleteDataRoomDialogOpen, setIsDeleteDataRoomDialogOpen] = useState(false)
  const [isRenameFileDialogOpen, setIsRenameFileDialogOpen] = useState(false)
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false)
  const [isViewFileDialogOpen, setIsViewFileDialogOpen] = useState(false)

  const [targetFolderId, setTargetFolderId] = useState<NodeId | null>(null)
  const [activeFileId, setActiveFileId] = useState<NodeId | null>(null)

  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)
  const [dataRoomNameDraft, setDataRoomNameDraft] = useState('')
  const [dataRoomNameError, setDataRoomNameError] = useState<string | null>(null)
  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)

  const [feedbackQueue, setFeedbackQueue] = useState<FeedbackState[]>([])
  const [sortState, setSortState] = useState<SortState>(() => loadSortModePreference())
  const feedbackTimeoutMs = loadFeedbackTimeoutMs()

  const rawTranslate = i18n.t as unknown as (key: string, options?: Record<string, unknown>) => string
  const tr = (key: string, options?: Record<string, unknown>): string => rawTranslate(key, options)

  const resolveDisplayName = (value: string) => (value.startsWith('i18n:') ? tr(value.slice(5)) : value)

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
  const activeFolder = selectActiveFolder(entities, rootFolder, selectedFolderId)
  const breadcrumbs = selectBreadcrumbs(entities, activeFolder)
  const visibleContentItems = selectVisibleContentItems(entities, activeFolder, resolveDisplayName, sortState)
  const locale = i18n.resolvedLanguage ?? i18n.language

  const canDeleteActiveDataRoom = Boolean(activeDataRoom)
  const dataRoomDeleteSummary = activeDataRoom
    ? getDataRoomDeleteSummary(entities, activeDataRoom.id)
    : { folderCount: 0, fileCount: 0 }

  const targetFolder = targetFolderId ? entities.foldersById[targetFolderId] : null
  const folderDeleteSummary = activeFolder
    ? getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
    : { folderCount: 0, fileCount: 0 }
  const activeFile = activeFileId ? entities.filesById[activeFileId] : null

  const selectDataRoom = (dataRoomId: NodeId) => {
    dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId } })
  }

  const selectFolder = (folderId: NodeId) => {
    dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
  }

  const actions = useHomePageHandlers({
    dataRoom: {
      t: tr,
      entities,
      dispatch,
      activeDataRoom,
      dataRoomNameDraft,
      resolveDisplayName,
      hasDuplicateDataRoomDisplayName,
      enqueueFeedback,
      setDataRoomNameDraft,
      setDataRoomNameError,
      setIsCreateDataRoomDialogOpen,
      setIsRenameDataRoomDialogOpen,
      setIsDeleteDataRoomDialogOpen,
    },
    folder: {
      t: tr,
      entities,
      dispatch,
      activeDataRoom,
      activeFolder,
      targetFolder,
      folderNameDraft,
      resolveDisplayName,
      enqueueFeedback,
      setFolderNameDraft,
      setFolderNameError,
      setTargetFolderId,
      setIsCreateFolderDialogOpen,
      setIsRenameFolderDialogOpen,
      setIsDeleteFolderDialogOpen,
    },
    file: {
      t: tr,
      entities,
      dispatch,
      activeFolder,
      activeFile,
      fileNameDraft,
      enqueueFeedback,
      setActiveFileId,
      setFileNameDraft,
      setFileNameError,
      setIsRenameFileDialogOpen,
      setIsDeleteFileDialogOpen,
      setIsViewFileDialogOpen,
    },
    sort: {
      sortState,
      setSortState,
    },
  })

  return {
    t,
    entities,
    selection: {
      selectedDataRoomId,
      selectedFolderId,
      dataRooms,
      activeDataRoom,
      rootFolder,
      activeFolder,
      breadcrumbs,
      visibleContentItems,
      locale,
      targetFolder,
      activeFile,
      canDeleteActiveDataRoom,
      dataRoomDeleteSummary,
      folderDeleteSummary,
    },
    viewHelpers: {
      resolveDisplayName,
    },
    uiState: {
      uploadInputRef,
      sortState,
      feedbackTimeoutMs,
      feedbackQueue,
      dialogs: {
        isCreateDataRoomDialogOpen,
        isRenameDataRoomDialogOpen,
        isDeleteDataRoomDialogOpen,
        isCreateFolderDialogOpen,
        isRenameFolderDialogOpen,
        isDeleteFolderDialogOpen,
        isRenameFileDialogOpen,
        isDeleteFileDialogOpen,
        isViewFileDialogOpen,
      },
      forms: {
        dataRoomNameDraft,
        dataRoomNameError,
        folderNameDraft,
        folderNameError,
        fileNameDraft,
        fileNameError,
      },
    },
    handlers: {
      ...actions,
      dismissFeedback,
      selectDataRoom,
      selectFolder,
    },
  }
}
