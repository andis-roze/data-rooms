import { useRef, useState } from 'react'
import { loadSortModePreference } from '../services/sortPreference'
import type { NodeId } from '../../dataroom/model'
import type { SortState } from '../types'
import { DEFAULT_LIST_VIEW_ITEMS_PER_PAGE } from '../config/pagination'

export function useHomePageDialogState() {
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false)
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false)
  const [isCreateDataRoomDialogOpen, setIsCreateDataRoomDialogOpen] = useState(false)
  const [isRenameDataRoomDialogOpen, setIsRenameDataRoomDialogOpen] = useState(false)
  const [isDeleteDataRoomDialogOpen, setIsDeleteDataRoomDialogOpen] = useState(false)
  const [isRenameFileDialogOpen, setIsRenameFileDialogOpen] = useState(false)
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false)
  const [isViewFileDialogOpen, setIsViewFileDialogOpen] = useState(false)
  const [isDeleteSelectedContentDialogOpen, setIsDeleteSelectedContentDialogOpen] = useState(false)

  return {
    isCreateFolderDialogOpen,
    setIsCreateFolderDialogOpen,
    isRenameFolderDialogOpen,
    setIsRenameFolderDialogOpen,
    isDeleteFolderDialogOpen,
    setIsDeleteFolderDialogOpen,
    isCreateDataRoomDialogOpen,
    setIsCreateDataRoomDialogOpen,
    isRenameDataRoomDialogOpen,
    setIsRenameDataRoomDialogOpen,
    isDeleteDataRoomDialogOpen,
    setIsDeleteDataRoomDialogOpen,
    isRenameFileDialogOpen,
    setIsRenameFileDialogOpen,
    isDeleteFileDialogOpen,
    setIsDeleteFileDialogOpen,
    isViewFileDialogOpen,
    setIsViewFileDialogOpen,
    isDeleteSelectedContentDialogOpen,
    setIsDeleteSelectedContentDialogOpen,
  }
}

export function useHomePageFormState() {
  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)
  const [dataRoomNameDraft, setDataRoomNameDraft] = useState('')
  const [dataRoomNameError, setDataRoomNameError] = useState<string | null>(null)
  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)

  return {
    folderNameDraft,
    setFolderNameDraft,
    folderNameError,
    setFolderNameError,
    dataRoomNameDraft,
    setDataRoomNameDraft,
    dataRoomNameError,
    setDataRoomNameError,
    fileNameDraft,
    setFileNameDraft,
    fileNameError,
    setFileNameError,
  }
}

export function useHomePageTransientState() {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<NodeId | null>(null)
  const [activeFileId, setActiveFileId] = useState<NodeId | null>(null)
  const [highlightedContentItemId, setHighlightedContentItemId] = useState<NodeId | null>(null)
  const [listViewPage, setListViewPage] = useState(0)
  const [listViewItemsPerPage, setListViewItemsPerPage] = useState(DEFAULT_LIST_VIEW_ITEMS_PER_PAGE)
  const [sortState, setSortState] = useState<SortState>(() => loadSortModePreference())

  return {
    uploadInputRef,
    targetFolderId,
    setTargetFolderId,
    activeFileId,
    setActiveFileId,
    highlightedContentItemId,
    setHighlightedContentItemId,
    listViewPage,
    setListViewPage,
    listViewItemsPerPage,
    setListViewItemsPerPage,
    sortState,
    setSortState,
  }
}
