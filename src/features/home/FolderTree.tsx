import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { DataRoom, DataRoomState, NodeId } from '../dataroom/model'
import { formatPathForDisplay } from './services/formatters'
import { getFolderChildren } from './utils'

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
  const folderDisplayName = renderFolderName(folder.name)

  return (
    <>
      <ListItemButton
        selected={selectedFolderId === folder.id}
        onClick={() => onSelectFolder(folder.id)}
        sx={{ pl: 2 + depth * 2 }}
        title={folderDisplayName}
        aria-label={folderDisplayName}
      >
        <ListItemText primary={formatPathForDisplay(folderDisplayName)} primaryTypographyProps={{ noWrap: true }} />
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

export function DataRoomTreeNode({
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
  const dataRoomDisplayName = renderDataRoomName(dataRoom.name)

  return (
    <>
      <ListItemButton
        selected={dataRoomSelected && rootSelected}
        onClick={() => onSelectDataRoom(dataRoom.id)}
        sx={{ pl: 1.5 }}
        title={dataRoomDisplayName}
        aria-label={dataRoomDisplayName}
      >
        <ListItemText
          primary={formatPathForDisplay(dataRoomDisplayName)}
          primaryTypographyProps={{ fontWeight: 700, noWrap: true }}
        />
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
