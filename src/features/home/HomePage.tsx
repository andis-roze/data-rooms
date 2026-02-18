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
import FormControl from '@mui/material/FormControl'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  getFileNameValidationError,
  getFolderDeleteSummary,
  getFolderNameValidationError,
  getPdfUploadValidationError,
  hasDuplicateFileName,
  hasDuplicateFolderName,
  preparePdfUpload,
  type DataRoomState,
  type FileNode,
  type Folder,
  type NodeId,
} from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'

interface FeedbackState {
  message: string
  severity: 'success' | 'error'
}

let fallbackIdCounter = 0

function generateNodeId(prefix: 'folder' | 'file'): NodeId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  fallbackIdCounter += 1
  return `${prefix}-${fallbackIdCounter}`
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

interface FolderTreeNodeProps {
  folderId: NodeId
  state: DataRoomState
  selectedFolderId: NodeId | null
  onSelectFolder: (folderId: NodeId) => void
  depth?: number
  visited?: Set<NodeId>
}

function FolderTreeNode({
  folderId,
  state,
  selectedFolderId,
  onSelectFolder,
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
        <ListItemText primary={folder.name} primaryTypographyProps={{ noWrap: true }} />
      </ListItemButton>
      {children.map((childFolder) => (
        <FolderTreeNode
          key={childFolder.id}
          folderId={childFolder.id}
          state={state}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          depth={depth + 1}
          visited={nextVisited}
        />
      ))}
    </>
  )
}

export function HomePage() {
  const { entities, selectedDataRoomId, selectedFolderId } = useDataRoomState()
  const dispatch = useDataRoomDispatch()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [renameFileDialogOpen, setRenameFileDialogOpen] = useState(false)
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false)
  const [viewFileDialogOpen, setViewFileDialogOpen] = useState(false)

  const [folderNameDraft, setFolderNameDraft] = useState('')
  const [folderNameError, setFolderNameError] = useState<string | null>(null)

  const [fileNameDraft, setFileNameDraft] = useState('')
  const [fileNameError, setFileNameError] = useState<string | null>(null)
  const [activeFileId, setActiveFileId] = useState<NodeId | null>(null)

  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const dataRooms = entities.dataRoomOrder.map((id) => entities.dataRoomsById[id]).filter(isDefined)

  if (dataRooms.length === 0) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            No Data Room available
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A Data Room will appear here once it is created.
          </Typography>
        </Paper>
      </Container>
    )
  }

  const activeDataRoom =
    (selectedDataRoomId ? entities.dataRoomsById[selectedDataRoomId] : undefined) ?? dataRooms[0]
  const rootFolder = entities.foldersById[activeDataRoom.rootFolderId]

  if (!rootFolder) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Data Room structure is incomplete
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

  const canDeleteActiveFolder = activeFolder.id !== rootFolder.id
  const deleteSummary = getFolderDeleteSummary(entities, activeFolder.id)
  const activeFile = activeFileId ? entities.filesById[activeFileId] : null

  const openCreateDialog = () => {
    setFolderNameDraft('')
    setFolderNameError(null)
    setCreateDialogOpen(true)
  }

  const openRenameDialog = () => {
    setFolderNameDraft(activeFolder.name)
    setFolderNameError(null)
    setRenameDialogOpen(true)
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
      setFolderNameError(validationError)
      return
    }

    if (hasDuplicateFolderName(entities, activeFolder.id, folderNameDraft)) {
      setFolderNameError('Folder with this name already exists in this location.')
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
    setFeedback({ message: 'Folder created.', severity: 'success' })
  }

  const handleRenameFolder = () => {
    const validationError = getFolderNameValidationError(folderNameDraft)

    if (validationError) {
      setFolderNameError(validationError)
      return
    }

    if (hasDuplicateFolderName(entities, activeFolder.parentFolderId, folderNameDraft, activeFolder.id)) {
      setFolderNameError('Folder with this name already exists in this location.')
      return
    }

    dispatch({
      type: 'dataroom/renameFolder',
      payload: {
        folderId: activeFolder.id,
        folderName: folderNameDraft,
      },
    })

    setRenameDialogOpen(false)
    setFeedback({ message: 'Folder renamed.', severity: 'success' })
  }

  const handleDeleteFolder = () => {
    dispatch({
      type: 'dataroom/deleteFolder',
      payload: {
        folderId: activeFolder.id,
      },
    })

    setDeleteDialogOpen(false)
    setFeedback({ message: 'Folder deleted.', severity: 'success' })
  }

  const handleUploadInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    const uploadError = getPdfUploadValidationError(selectedFile)

    if (uploadError) {
      setFeedback({ message: uploadError, severity: 'error' })
      event.target.value = ''
      return
    }

    const preparedUpload = preparePdfUpload(selectedFile)
    const nameError = getFileNameValidationError(preparedUpload.fileName)

    if (nameError) {
      setFeedback({ message: nameError, severity: 'error' })
      event.target.value = ''
      return
    }

    if (hasDuplicateFileName(entities, activeFolder.id, preparedUpload.fileName)) {
      setFeedback({ message: 'File with this name already exists in this location.', severity: 'error' })
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

    setFeedback({ message: 'PDF uploaded.', severity: 'success' })
    event.target.value = ''
  }

  const handleRenameFile = () => {
    if (!activeFile) {
      return
    }

    const validationError = getFileNameValidationError(fileNameDraft)

    if (validationError) {
      setFileNameError(validationError)
      return
    }

    if (hasDuplicateFileName(entities, activeFile.parentFolderId, fileNameDraft, activeFile.id)) {
      setFileNameError('File with this name already exists in this location.')
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
    setFeedback({ message: 'File renamed.', severity: 'success' })
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
    setFeedback({ message: 'File deleted.', severity: 'success' })
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
            Data Rooms
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={activeDataRoom.id}
              onChange={(event) => {
                dispatch({
                  type: 'dataroom/selectDataRoom',
                  payload: { dataRoomId: event.target.value },
                })
              }}
              aria-label="Select Data Room"
            >
              {dataRooms.map((dataRoom) => (
                <MenuItem key={dataRoom.id} value={dataRoom.id}>
                  {dataRoom.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
            Folder tree
          </Typography>
          <List dense disablePadding aria-label="Folder tree">
            <FolderTreeNode
              folderId={rootFolder.id}
              state={entities}
              selectedFolderId={activeFolder.id}
              onSelectFolder={(folderId) => {
                dispatch({ type: 'dataroom/selectFolder', payload: { folderId } })
              }}
            />
          </List>
        </Box>

        <Box component="section" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {activeDataRoom.name}
              </Typography>
              <Breadcrumbs aria-label="Folder breadcrumbs">
                {breadcrumbs.map((folder) => (
                  <Button
                    key={folder.id}
                    size="small"
                    color={folder.id === activeFolder.id ? 'primary' : 'inherit'}
                    onClick={() => {
                      dispatch({ type: 'dataroom/selectFolder', payload: { folderId: folder.id } })
                    }}
                  >
                    {folder.name}
                  </Button>
                ))}
              </Breadcrumbs>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" onClick={openCreateDialog}>
                Create folder
              </Button>
              <Button variant="outlined" onClick={openRenameDialog}>
                Rename folder
              </Button>
              <Button variant="outlined" color="error" disabled={!canDeleteActiveFolder} onClick={() => setDeleteDialogOpen(true)}>
                Delete folder
              </Button>
              <Button variant="text" onClick={() => uploadInputRef.current?.click()}>
                Upload PDF
              </Button>
              <Button variant="text" disabled>
                Sort: Name (A-Z)
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
              <List aria-label="Current folder contents">
                {childFolders.map((folder) => (
                  <ListItemButton
                    key={folder.id}
                    onClick={() => {
                      dispatch({ type: 'dataroom/selectFolder', payload: { folderId: folder.id } })
                    }}
                  >
                    <ListItemText primary={folder.name} secondary="Folder" />
                  </ListItemButton>
                ))}

                {childFiles.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          aria-label={`View file ${file.name}`}
                          onClick={() => openViewFileDialog(file)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          aria-label={`Rename file ${file.name}`}
                          onClick={() => openRenameFileDialog(file)}
                        >
                          Rename
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          aria-label={`Delete file ${file.name}`}
                          onClick={() => openDeleteFileDialog(file)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText primary={file.name} secondary={`PDF - ${formatFileSize(file.size)}`} />
                  </ListItem>
                ))}

                {childFolders.length === 0 && childFiles.length === 0 ? (
                  <Box sx={{ px: 2, py: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      This folder is empty
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      Create a folder or upload a PDF to start organizing your Data Room.
                    </Typography>
                  </Box>
                ) : null}
              </List>
            </Paper>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="Folder name"
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
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Rename folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="Folder name"
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
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameFolder} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete folder</DialogTitle>
        <DialogContent>
          <Typography>Delete "{activeFolder.name}" and all nested content?</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            This will remove {deleteSummary.folderCount} folder(s) and {deleteSummary.fileCount} file(s).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteFolder}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameFileDialogOpen} onClose={() => setRenameFileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Rename file</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="File name"
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
          <Button onClick={() => setRenameFileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameFile} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteFileDialogOpen} onClose={() => setDeleteFileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete file</DialogTitle>
        <DialogContent>
          <Typography>Delete "{activeFile?.name ?? ''}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFileDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteFile}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewFileDialogOpen} onClose={() => setViewFileDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{activeFile?.name ?? 'File preview'}</DialogTitle>
        <DialogContent>
          {activeFile?.objectUrl ? (
            <Box
              component="iframe"
              title={activeFile.name}
              src={activeFile.objectUrl}
              sx={{ width: '100%', minHeight: '70vh', border: 0 }}
            />
          ) : (
            <Typography color="text.secondary">File preview is unavailable in this environment.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewFileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2500}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={feedback?.severity ?? 'success'} variant="filled" onClose={() => setFeedback(null)}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
