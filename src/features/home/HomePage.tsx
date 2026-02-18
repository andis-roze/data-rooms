import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Folder, DataRoomState, FileNode, NodeId } from '../dataroom/model'
import { useDataRoomDispatch, useDataRoomState } from '../dataroom/state'

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
              <Button variant="contained" disabled>
                Create folder
              </Button>
              <Button variant="outlined" disabled>
                Upload PDF
              </Button>
              <Button variant="text" disabled>
                Sort: Name (A-Z)
              </Button>
            </Stack>

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
                  <ListItemButton key={file.id}>
                    <ListItemText
                      primary={file.name}
                      secondary={`PDF - ${formatFileSize(file.size)}`}
                    />
                  </ListItemButton>
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
    </Container>
  )
}
