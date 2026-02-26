import {
  getDataRoomDeleteSummary,
  getFolderDeleteSummary,
  type DataRoomState,
  type NodeId,
} from '../../dataroom/model'
import { selectActiveDataRoom, selectActiveFolder, selectBreadcrumbs, selectDataRooms, selectRootFolder, selectVisibleContentItems } from '../selectors/homeSelectors'
import type { SortState } from '../types'

const EMPTY_DELETE_SUMMARY = { folderCount: 0, fileCount: 0 }

interface UseHomePageSelectionStateParams {
  entities: DataRoomState
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  sortState: SortState
  targetFolderId: NodeId | null
  activeFileId: NodeId | null
  resolvedLanguage?: string
  language: string
}

export function useHomePageSelectionState({
  entities,
  selectedDataRoomId,
  selectedFolderId,
  sortState,
  targetFolderId,
  activeFileId,
  resolvedLanguage,
  language,
}: UseHomePageSelectionStateParams) {
  const dataRooms = selectDataRooms(entities)
  const activeDataRoom = selectActiveDataRoom(entities, selectedDataRoomId, dataRooms)
  const rootFolder = selectRootFolder(entities, activeDataRoom)
  const activeFolder = selectActiveFolder(entities, rootFolder, selectedFolderId)
  const breadcrumbs = selectBreadcrumbs(entities, activeFolder)
  const visibleContentItems = selectVisibleContentItems(entities, activeFolder, sortState)
  const activeDataRoomId = activeDataRoom?.id ?? null
  const locale = resolvedLanguage ?? language

  const getFolderById = (folderId: NodeId | null) => (folderId ? entities.foldersById[folderId] ?? null : null)
  const getFileById = (fileId: NodeId | null) => (fileId ? entities.filesById[fileId] ?? null : null)

  const targetFolder = getFolderById(targetFolderId)
  const activeFile = getFileById(activeFileId)

  const canDeleteActiveDataRoom = Boolean(activeDataRoom)
  const dataRoomDeleteSummary = activeDataRoom
    ? getDataRoomDeleteSummary(entities, activeDataRoom.id)
    : EMPTY_DELETE_SUMMARY
  const folderDeleteSummary = activeFolder
    ? getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
    : EMPTY_DELETE_SUMMARY

  return {
    dataRooms,
    activeDataRoom,
    rootFolder,
    activeFolder,
    breadcrumbs,
    visibleContentItems,
    activeDataRoomId,
    locale,
    targetFolder,
    activeFile,
    canDeleteActiveDataRoom,
    dataRoomDeleteSummary,
    folderDeleteSummary,
  }
}
