import { useRef, useState, type ChangeEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import {
  getDataRoomDeleteSummary,
  getDataRoomNameValidationError,
  getFileNameValidationError,
  getFolderDeleteSummary,
  getFolderNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateDataRoomName,
  hasDuplicateFileName,
  hasDuplicateFolderName,
  normalizeNodeName,
  preparePdfUpload,
  type DataRoomState,
  type DataRoom,
  type FileNode,
  type Folder,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'

interface FeedbackState {
  id: number
  message: string
  severity: 'success' | 'error'
}

type SortField = 'name' | 'type' | 'updated'
type SortDirection = 'asc' | 'desc'
interface SortState {
  field: SortField
  direction: SortDirection
}

interface FolderContentItem {
  kind: 'folder' | 'file'
  id: NodeId
  name: string
  displayName?: string
  updatedAt: number
  folder?: Folder
  file?: FileNode
  isParentNavigation?: boolean
}

const SORT_PREFERENCE_STORAGE_KEY = 'dataroom/view-preferences'
let inMemorySortPreference: SortState = { field: 'name', direction: 'asc' }

function fallbackUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

function generateNodeId(prefix: 'folder' | 'file' | 'dataroom'): NodeId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${fallbackUuidV4()}`
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

function byNameAsc(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

function getFolderChildren(state: DataRoomState, folder: Folder): Folder[] {
  return folder.childFolderIds.map((id) => state.foldersById[id]).filter(isDefined).sort(byNameAsc)
}

function getFileChildren(state: DataRoomState, folder: Folder): FileNode[] {
  return folder.fileIds.map((id) => state.filesById[id]).filter(isDefined).sort(byNameAsc)
}

function loadSortModePreference(): SortState {
  if (typeof window === 'undefined') {
    return inMemorySortPreference
  }

  try {
    const raw = window.localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY)

    if (!raw) {
      return inMemorySortPreference
    }

    const parsed = JSON.parse(raw) as { sortField?: string; sortDirection?: string; sortMode?: string }

    if (
      (parsed.sortField === 'name' || parsed.sortField === 'type' || parsed.sortField === 'updated') &&
      (parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc')
    ) {
      return { field: parsed.sortField, direction: parsed.sortDirection }
    }

    // Backward compatibility with previous select-based sort mode.
    if (parsed.sortMode === 'name-asc') {
      return { field: 'name', direction: 'asc' }
    }
    if (parsed.sortMode === 'name-desc') {
      return { field: 'name', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-desc') {
      return { field: 'updated', direction: 'desc' }
    }
    if (parsed.sortMode === 'updated-asc') {
      return { field: 'updated', direction: 'asc' }
    }
    if (parsed.sortMode === 'type') {
      return { field: 'type', direction: 'asc' }
    }
  } catch {
    return inMemorySortPreference
  }

  return inMemorySortPreference
}

function saveSortModePreference(sortState: SortState): void {
  inMemorySortPreference = sortState

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      SORT_PREFERENCE_STORAGE_KEY,
      JSON.stringify({ sortField: sortState.field, sortDirection: sortState.direction }),
    )
  } catch {
    // Ignore persistence failures and keep in-memory preference.
  }
}

function buildFolderPath(state: DataRoomState, folderId: NodeId): Folder[] {
  const path: Folder[] = []
  const visited = new Set<NodeId>()
  let currentId: NodeId | null = folderId

  while (currentId) {
    if (visited.has(currentId)) {
      break
    }

    visited.add(currentId)
    const folder = state.foldersById[currentId]

    if (!folder) {
      break
    }

    path.push(folder)
    currentId = folder.parentFolderId
  }

  return path.reverse()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function formatUpdatedAt(value: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

interface FolderTreeNodeProps {
  folderId: NodeId
  state: DataRoomState
  selectedFolderId: NodeId | null
  onSelectFolder: (folderId: NodeId) => void
  renderFolderName: (name: string) => string
  depth?: number
  visited?: Set<NodeId>
}

function FolderTreeNode({
  folderId,
  state,
  selectedFolderId,
  onSelectFolder,
  renderFolderName,
  depth = 0,
  visited = new Set<NodeId>(),
}: FolderTreeNodeProps) {
  if (visited.has(folderId)) {
    return null
  }

  const folder = state.foldersById[folderId]

  if (!folder) {
    return null
  }

  const nextVisited = new Set(visited)
  nextVisited.add(folderId)
  const children = getFolderChildren(state, folder)

  return (
    <>
      <ListItemButton
        selected={selectedFolderId === folder.id}
        onClick={() => onSelectFolder(folder.id)}
        sx={{ pl: 2 + depth * 2 }}
      >
        <ListItemText primary={renderFolderName(folder.name)} primaryTypographyProps={{ noWrap: true }} />
      </ListItemButton>
      {children.map((childFolder) => (
        <FolderTreeNode
          key={childFolder.id}
          folderId={childFolder.id}
          state={state}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          renderFolderName={renderFolderName}
          depth={depth + 1}
          visited={nextVisited}
        />
      ))}
    </>
  )
}

interface DataRoomTreeNodeProps {
  dataRoom: DataRoom
  state: DataRoomState
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  onSelectDataRoom: (dataRoomId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
  renderDataRoomName: (name: string) => string
  renderFolderName: (name: string) => string
}

function DataRoomTreeNode({
  dataRoom,
  state,
  selectedDataRoomId,
  selectedFolderId,
  onSelectDataRoom,
  onSelectFolder,
  renderDataRoomName,
  renderFolderName,
}: DataRoomTreeNodeProps) {
  const rootFolder = state.foldersById[dataRoom.rootFolderId]
  const rootChildren = rootFolder ? getFolderChildren(state, rootFolder) : []
  const dataRoomSelected = selectedDataRoomId === dataRoom.id
  const rootSelected = selectedFolderId === dataRoom.rootFolderId

  return (
    <>
      <ListItemButton
        selected={dataRoomSelected && rootSelected}
        onClick={() => onSelectDataRoom(dataRoom.id)}
        sx={{ pl: 1.5 }}
      >
        <ListItemText primary={renderDataRoomName(dataRoom.name)} primaryTypographyProps={{ fontWeight: 700, noWrap: true }} />
      </ListItemButton>
      {rootChildren.map((childFolder) => (
        <FolderTreeNode
          key={childFolder.id}
          folderId={childFolder.id}
          state={state}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          renderFolderName={renderFolderName}
          depth={1}
        />
      ))}
    </>
  )
}

export function HomePage() {
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

  const openCreateDataRoomDialog = () => {
    setDataRoomNameDraft('')
    setDataRoomNameError(null)
    setCreateDataRoomDialogOpen(true)
  }

  const openRenameDataRoomDialog = () => {
    if (!activeDataRoom) {
      return
    }

    setDataRoomNameDraft(resolveDisplayName(activeDataRoom.name))
    setDataRoomNameError(null)
    setRenameDataRoomDialogOpen(true)
  }

  const handleCreateDataRoom = () => {
    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(
        validationError === 'empty' ? t('dataroomErrorDataRoomNameEmpty') : t('dataroomErrorDataRoomNameReserved'),
      )
      return
    }

    if (hasDuplicateDataRoomDisplayName(dataRoomNameDraft) || hasDuplicateDataRoomName(entities, dataRoomNameDraft)) {
      setDataRoomNameError(t('dataroomErrorDataRoomNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/createDataRoom',
      payload: {
        dataRoomId: generateNodeId('dataroom'),
        rootFolderId: generateNodeId('folder'),
        dataRoomName: dataRoomNameDraft,
        rootFolderName: t('dataroomSeedDefaultRootFolderName'),
      },
    })

    setCreateDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomCreated'), 'success')
  }

  const handleRenameDataRoom = () => {
    if (!activeDataRoom) {
      return
    }

    const validationError = getDataRoomNameValidationError(dataRoomNameDraft)

    if (validationError) {
      setDataRoomNameError(
        validationError === 'empty' ? t('dataroomErrorDataRoomNameEmpty') : t('dataroomErrorDataRoomNameReserved'),
      )
      return
    }

    if (
      hasDuplicateDataRoomDisplayName(dataRoomNameDraft, activeDataRoom.id) ||
      hasDuplicateDataRoomName(entities, dataRoomNameDraft, activeDataRoom.id)
    ) {
      setDataRoomNameError(t('dataroomErrorDataRoomNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameDataRoom',
      payload: {
        dataRoomId: activeDataRoom.id,
        dataRoomName: dataRoomNameDraft,
      },
    })

    setRenameDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomRenamed'), 'success')
  }

  const handleDeleteDataRoom = () => {
    if (!activeDataRoom) {
      return
    }

    dispatch({
      type: 'dataroom/deleteDataRoom',
      payload: {
        dataRoomId: activeDataRoom.id,
      },
    })

    setDeleteDataRoomDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackDataRoomDeleted'), 'success')
  }

  if (dataRooms.length === 0) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              {t('dataroomNoDataRoomTitle')}
            </Typography>
            <Typography color="text.secondary">{t('dataroomNoDataRoomBody')}</Typography>
            <Button variant="contained" onClick={openCreateDataRoomDialog}>
              {t('dataroomActionCreateDataRoom')}
            </Button>
          </Stack>
        </Paper>

        <Dialog open={createDataRoomDialogOpen} onClose={() => setCreateDataRoomDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{t('dataroomDialogCreateDataRoomTitle')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              label={t('dataroomFieldDataRoomName')}
              value={dataRoomNameDraft}
              onChange={(event) => {
                setDataRoomNameDraft(event.target.value)
                setDataRoomNameError(null)
              }}
              error={Boolean(dataRoomNameError)}
              helperText={dataRoomNameError ?? ' '}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleCreateDataRoom()
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDataRoomDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
            <Button onClick={handleCreateDataRoom} variant="contained">
              {t('dataroomActionCreate')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    )
  }

  if (!rootFolder || !activeDataRoom) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            {t('dataroomStructureIncomplete')}
          </Typography>
        </Paper>
      </Container>
    )
  }

  const activeFolder =
    (selectedFolderId ? entities.foldersById[selectedFolderId] : undefined) ?? rootFolder
  const breadcrumbs = buildFolderPath(entities, activeFolder.id)
  const childFolders = getFolderChildren(entities, activeFolder)
  const childFiles = getFileChildren(entities, activeFolder)
  const parentFolder =
    activeFolder.parentFolderId ? entities.foldersById[activeFolder.parentFolderId] : undefined

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
  const rowGridTemplate = {
    xs: 'minmax(0,1fr) auto',
    md: 'minmax(0,1fr) 120px 130px 270px',
  }
  const actionGridTemplate = {
    xs: 'repeat(3, max-content)',
    md: 'repeat(3, minmax(84px, 1fr))',
  }

  const targetFolder = targetFolderId ? entities.foldersById[targetFolderId] : null
  const deleteSummary = getFolderDeleteSummary(entities, targetFolder?.id ?? activeFolder.id)
  const activeFile = activeFileId ? entities.filesById[activeFileId] : null

  const openCreateDialog = () => {
    setFolderNameDraft('')
    setFolderNameError(null)
    setCreateDialogOpen(true)
  }

  const openRenameDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setFolderNameDraft(resolveDisplayName(folder.name))
    setFolderNameError(null)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (folder: Folder) => {
    setTargetFolderId(folder.id)
    setDeleteDialogOpen(true)
  }
  const closeRenameDialog = () => {
    setRenameDialogOpen(false)
    setTargetFolderId(null)
    setFolderNameError(null)
  }
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setTargetFolderId(null)
  }

  const openRenameFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setFileNameDraft(file.name)
    setFileNameError(null)
    setRenameFileDialogOpen(true)
  }

  const openDeleteFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setDeleteFileDialogOpen(true)
  }

  const openViewFileDialog = (file: FileNode) => {
    setActiveFileId(file.id)
    setViewFileDialogOpen(true)
  }

  const handleCreateFolder = () => {
    const validationError = getFolderNameValidationError(folderNameDraft)

    if (validationError) {
      setFolderNameError(
        validationError === 'empty' ? t('dataroomErrorFolderNameEmpty') : t('dataroomErrorFolderNameReserved'),
      )
      return
    }

    if (hasDuplicateFolderName(entities, activeFolder.id, folderNameDraft)) {
      setFolderNameError(t('dataroomErrorFolderNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/createFolder',
      payload: {
        dataRoomId: activeDataRoom.id,
        parentFolderId: activeFolder.id,
        folderId: generateNodeId('folder'),
        folderName: folderNameDraft,
      },
    })

    setCreateDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFolderCreated'), 'success')
  }

  const handleRenameFolder = () => {
    if (!targetFolder) {
      return
    }

    const validationError = getFolderNameValidationError(folderNameDraft)

    if (validationError) {
      setFolderNameError(
        validationError === 'empty' ? t('dataroomErrorFolderNameEmpty') : t('dataroomErrorFolderNameReserved'),
      )
      return
    }

    if (hasDuplicateFolderName(entities, targetFolder.parentFolderId, folderNameDraft, targetFolder.id)) {
      setFolderNameError(t('dataroomErrorFolderNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameFolder',
      payload: {
        folderId: targetFolder.id,
        folderName: folderNameDraft,
      },
    })

    setRenameDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderRenamed'), 'success')
  }

  const handleDeleteFolder = () => {
    if (!targetFolder) {
      return
    }

    dispatch({
      type: 'dataroom/deleteFolder',
      payload: {
        folderId: targetFolder.id,
      },
    })

    setDeleteDialogOpen(false)
    setTargetFolderId(null)
    enqueueFeedback(t('dataroomFeedbackFolderDeleted'), 'success')
  }

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    const uploadError = getPdfUploadValidationError(selectedFile)

    if (uploadError) {
      enqueueFeedback(uploadError === 'invalidPdf' ? t('dataroomErrorPdfOnly') : t('dataroomErrorPdfOnly'), 'error')
      event.target.value = ''
      return
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const nameError = getFileNameValidationError(preparedUpload.fileName)

    if (nameError) {
      enqueueFeedback(nameError === 'empty' ? t('dataroomErrorFileNameEmpty') : t('dataroomErrorFileNameReserved'), 'error')
      event.target.value = ''
      return
    }

    if (hasDuplicateFileName(entities, activeFolder.id, preparedUpload.fileName)) {
      enqueueFeedback(t('dataroomErrorFileNameDuplicate'), 'error')
      event.target.value = ''
      return
    }

    dispatch({
      type: 'dataroom/uploadFile',
      payload: {
        parentFolderId: activeFolder.id,
        fileId: generateNodeId('file'),
        fileName: preparedUpload.fileName,
        size: preparedUpload.size,
        mimeType: preparedUpload.mimeType,
        objectUrl: preparedUpload.objectUrl,
      },
    })

    enqueueFeedback(t('dataroomFeedbackFileUploaded'), 'success')
    event.target.value = ''
  }

  const handleRenameFile = () => {
    if (!activeFile) {
      return
    }

    const validationError = getFileNameValidationError(fileNameDraft)

    if (validationError) {
      setFileNameError(
        validationError === 'empty' ? t('dataroomErrorFileNameEmpty') : t('dataroomErrorFileNameReserved'),
      )
      return
    }

    if (hasDuplicateFileName(entities, activeFile.parentFolderId, fileNameDraft, activeFile.id)) {
      setFileNameError(t('dataroomErrorFileNameDuplicate'))
      return
    }

    dispatch({
      type: 'dataroom/renameFile',
      payload: {
        fileId: activeFile.id,
        fileName: fileNameDraft,
      },
    })

    setRenameFileDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFileRenamed'), 'success')
  }

  const handleDeleteFile = () => {
    if (!activeFile) {
      return
    }

    dispatch({
      type: 'dataroom/deleteFile',
      payload: {
        fileId: activeFile.id,
      },
    })

    setDeleteFileDialogOpen(false)
    enqueueFeedback(t('dataroomFeedbackFileDeleted'), 'success')
  }

  const toggleSort = (field: SortField) => {
    const nextState: SortState =
      sortState.field === field
        ? { field, direction: sortState.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }

    setSortState(nextState)
    saveSortModePreference(nextState)
  }

  return (
    <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: { md: '70vh' },
        }}
      >
        <Box
          component="aside"
          sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t('dataroomSidebarTitle')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1} sx={{ mb: 1.5 }}>
            <Button size="small" variant="contained" onClick={openCreateDataRoomDialog}>
              {t('dataroomActionCreateDataRoom')}
            </Button>
            <Button size="small" variant="outlined" onClick={openRenameDataRoomDialog}>
              {t('dataroomActionRenameDataRoom')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={!canDeleteActiveDataRoom}
              onClick={() => setDeleteDataRoomDialogOpen(true)}
            >
              {t('dataroomActionDeleteDataRoom')}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            {t('dataroomFolderTreeTitle')}
          </Typography>
          <List dense disablePadding aria-label={t('dataroomFolderTreeTitle')}>
            {dataRooms.map((dataRoom) => (
              <DataRoomTreeNode
                key={dataRoom.id}
                dataRoom={dataRoom}
                state={entities}
                selectedDataRoomId={selectedDataRoomId}
                selectedFolderId={selectedFolderId}
                onSelectDataRoom={(dataRoomId) => {
                  dispatch({ type: 'dataroom/selectDataRoom', payload: { dataRoomId } })
                }}
                onSelectFolder={(folderId) => {
                  dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
                }}
                renderDataRoomName={resolveDisplayName}
                renderFolderName={resolveDisplayName}
              />
            ))}
          </List>
        </Box>

        <Box component="section" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {resolveDisplayName(activeDataRoom.name)}
              </Typography>
              <Breadcrumbs aria-label={t('dataroomBreadcrumbsLabel')}>
                {breadcrumbs.map((folder) => (
                  <Button
                    key={folder.id}
                    size="small"
                    color={folder.id === activeFolder.id ? 'primary' : 'inherit'}
                    onClick={() => {
                      dispatch({ type: 'dataroom/selectFolder', payload: { folderId: folder.id } })
                    }}
                  >
                    {resolveDisplayName(folder.name)}
                  </Button>
                ))}
              </Breadcrumbs>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" onClick={openCreateDialog}>
                {t('dataroomActionCreateFolder')}
              </Button>
              <Button variant="text" onClick={() => uploadInputRef.current?.click()}>
                {t('dataroomActionUploadPdf')}
              </Button>
            </Stack>

            <input
              ref={uploadInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleUploadInputChange}
              data-testid="upload-pdf-input"
              style={{ display: 'none' }}
            />

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: rowGridTemplate,
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Button
                  size="small"
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
                  onClick={() => toggleSort('name')}
                  aria-label={t('dataroomSortByNameAria')}
                >
                  {t('dataroomColumnName')} {sortState.field === 'name' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
                  onClick={() => toggleSort('type')}
                  aria-label={t('dataroomSortByTypeAria')}
                >
                  {t('dataroomColumnType')} {sortState.field === 'type' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, justifyContent: 'flex-start', px: 0.5, minWidth: 0 }}
                  onClick={() => toggleSort('updated')}
                  aria-label={t('dataroomSortByUpdatedAria')}
                >
                  {t('dataroomColumnUpdated')} {sortState.field === 'updated' ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end' }}>
                  {t('dataroomColumnActions')}
                </Typography>
              </Box>
              <List aria-label={t('dataroomCurrentFolderContentsLabel')}>
                {visibleContentItems.map((item) => {
                  if (item.kind === 'folder' && item.folder) {
                    return (
                      <ListItem key={item.id} disablePadding sx={{ px: 2, py: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: rowGridTemplate,
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Typography noWrap>{item.displayName ?? resolveDisplayName(item.folder.name)}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {t('dataroomFolderItemType')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {formatUpdatedAt(item.folder.updatedAt, locale)}
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: actionGridTemplate,
                              gap: 0.5,
                              justifySelf: 'end',
                              justifyItems: { xs: 'end', md: 'stretch' },
                              width: { xs: 'auto', md: '100%' },
                            }}
                          >
                            <Button
                              size="small"
                              sx={{ minWidth: 84 }}
                              aria-label={t('dataroomAriaOpenFolder', { name: resolveDisplayName(item.folder.name) })}
                              onClick={() => {
                                dispatch({ type: 'dataroom/selectFolder', payload: { folderId: item.folder.id } })
                              }}
                            >
                              {t('dataroomActionOpenFolder')}
                            </Button>
                            {item.isParentNavigation ? (
                              <>
                                <Box />
                                <Box />
                              </>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  sx={{ minWidth: 84 }}
                                  aria-label={t('dataroomAriaRenameFolder', { name: resolveDisplayName(item.folder.name) })}
                                  onClick={() => openRenameDialog(item.folder)}
                                >
                                  {t('dataroomActionRename')}
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  sx={{ minWidth: 84 }}
                                  aria-label={t('dataroomAriaDeleteFolder', { name: resolveDisplayName(item.folder.name) })}
                                  onClick={() => openDeleteDialog(item.folder)}
                                >
                                  {t('dataroomActionDelete')}
                                </Button>
                              </>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                    )
                  }

                  if (item.kind === 'file' && item.file) {
                    return (
                      <ListItem key={item.id} disablePadding sx={{ px: 2, py: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: rowGridTemplate,
                            gap: 1,
                            alignItems: 'center',
                          }}
                        >
                          <Typography noWrap>{item.file.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {`${t('dataroomFileItemType')} - ${formatFileSize(item.file.size)}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {formatUpdatedAt(item.file.updatedAt, locale)}
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: actionGridTemplate,
                              gap: 0.5,
                              justifySelf: 'end',
                              justifyItems: { xs: 'end', md: 'stretch' },
                              width: { xs: 'auto', md: '100%' },
                            }}
                          >
                            <Button
                              size="small"
                              sx={{ minWidth: 84 }}
                              aria-label={t('dataroomAriaViewFile', { name: item.file.name })}
                              onClick={() => openViewFileDialog(item.file)}
                            >
                              {t('dataroomActionViewFile')}
                            </Button>
                            <Button
                              size="small"
                              sx={{ minWidth: 84 }}
                              aria-label={t('dataroomAriaRenameFile', { name: item.file.name })}
                              onClick={() => openRenameFileDialog(item.file)}
                            >
                              {t('dataroomActionRenameFile')}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              sx={{ minWidth: 84 }}
                              aria-label={t('dataroomAriaDeleteFile', { name: item.file.name })}
                              onClick={() => openDeleteFileDialog(item.file)}
                            >
                              {t('dataroomActionDeleteFile')}
                            </Button>
                          </Box>
                        </Box>
                      </ListItem>
                    )
                  }

                  return null
                })}

                {visibleContentItems.length === 0 ? (
                  <Box sx={{ px: 2, py: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t('dataroomEmptyFolderTitle')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {t('dataroomEmptyFolderBody')}
                    </Typography>
                  </Box>
                ) : null}
              </List>
            </Paper>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={createDataRoomDialogOpen} onClose={() => setCreateDataRoomDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogCreateDataRoomTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldDataRoomName')}
            value={dataRoomNameDraft}
            onChange={(event) => {
              setDataRoomNameDraft(event.target.value)
              setDataRoomNameError(null)
            }}
            error={Boolean(dataRoomNameError)}
            helperText={dataRoomNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleCreateDataRoom()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDataRoomDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button onClick={handleCreateDataRoom} variant="contained">
            {t('dataroomActionCreate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameDataRoomDialogOpen} onClose={() => setRenameDataRoomDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameDataRoomTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldDataRoomName')}
            value={dataRoomNameDraft}
            onChange={(event) => {
              setDataRoomNameDraft(event.target.value)
              setDataRoomNameError(null)
            }}
            error={Boolean(dataRoomNameError)}
            helperText={dataRoomNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleRenameDataRoom()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDataRoomDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button onClick={handleRenameDataRoom} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDataRoomDialogOpen} onClose={() => setDeleteDataRoomDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteDataRoomTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteDataRoomQuestion', { name: resolveDisplayName(activeDataRoom.name) })}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteDataRoomImpact', {
              folderCount: dataRoomDeleteSummary.folderCount,
              fileCount: dataRoomDeleteSummary.fileCount,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDataRoomDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDeleteDataRoom}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogCreateFolderTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFolderName')}
            value={folderNameDraft}
            onChange={(event) => {
              setFolderNameDraft(event.target.value)
              setFolderNameError(null)
            }}
            error={Boolean(folderNameError)}
            helperText={folderNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleCreateFolder()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            {t('dataroomActionCreate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameDialogOpen} onClose={closeRenameDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameFolderTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFolderName')}
            value={folderNameDraft}
            onChange={(event) => {
              setFolderNameDraft(event.target.value)
              setFolderNameError(null)
            }}
            error={Boolean(folderNameError)}
            helperText={folderNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleRenameFolder()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRenameDialog}>{t('dataroomActionCancel')}</Button>
          <Button onClick={handleRenameFolder} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteFolderTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('dataroomDeleteFolderQuestion', {
              name: targetFolder ? resolveDisplayName(targetFolder.name) : resolveDisplayName(activeFolder.name),
            })}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteFolderImpact', {
              folderCount: deleteSummary.folderCount,
              fileCount: deleteSummary.fileCount,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDeleteFolder}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameFileDialogOpen} onClose={() => setRenameFileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogRenameFileTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label={t('dataroomFieldFileName')}
            value={fileNameDraft}
            onChange={(event) => {
              setFileNameDraft(event.target.value)
              setFileNameError(null)
            }}
            error={Boolean(fileNameError)}
            helperText={fileNameError ?? ' '}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleRenameFile()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameFileDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button onClick={handleRenameFile} variant="contained">
            {t('dataroomActionRename')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteFileDialogOpen} onClose={() => setDeleteFileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteFileTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteFileQuestion', { name: activeFile?.name ?? '' })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFileDialogOpen(false)}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDeleteFile}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewFileDialogOpen} onClose={() => setViewFileDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{activeFile?.name ?? t('dataroomFilePreviewTitle')}</DialogTitle>
        <DialogContent>
          {activeFile?.objectUrl ? (
            <Box
              component="iframe"
              title={activeFile.name}
              src={activeFile.objectUrl}
              sx={{ width: '100%', minHeight: '70vh', border: 0 }}
            />
          ) : (
            <Typography color="text.secondary">{t('dataroomFilePreviewUnavailable')}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewFileDialogOpen(false)}>{t('dataroomActionClose')}</Button>
        </DialogActions>
      </Dialog>

      <Stack
        spacing={1}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: (theme) => theme.zIndex.snackbar,
          width: { xs: 'calc(100vw - 32px)', sm: 420 },
          maxWidth: '100%',
        }}
      >
        {feedbackQueue.map((feedback) => (
          <Alert
            key={feedback.id}
            severity={feedback.severity}
            variant="filled"
            onClose={() => dismissFeedback(feedback.id)}
          >
            {feedback.message}
          </Alert>
        ))}
      </Stack>
    </Container>
  )
}
