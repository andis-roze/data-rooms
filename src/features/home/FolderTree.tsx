import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import type { DragEvent, MouseEvent } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../dataroom/model'
import { formatPathForDisplay } from './services/formatters'
import { getFolderChildren } from './utils'

interface TreeExpandToggleProps {
  hasChildren: boolean
  isExpanded: boolean
  ariaLabel: string
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
  marginLeft?: number
}

function TreeExpandToggle({ hasChildren, isExpanded, ariaLabel, onToggle, marginLeft = 0.5 }: TreeExpandToggleProps) {
  if (!hasChildren) {
    return <Box sx={{ width: 36 }} />
  }

  return (
    <IconButton size="small" aria-label={ariaLabel} onClick={onToggle} sx={{ ml: marginLeft }}>
      {isExpanded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
    </IconButton>
  )
}

interface TreeNodeActionsProps {
  onMove: (event: MouseEvent<HTMLButtonElement>) => void
  onRename: (event: MouseEvent<HTMLButtonElement>) => void
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void
  moveAriaLabel: string
  renameAriaLabel: string
  deleteAriaLabel: string
  moveTooltip: string
  renameTooltip: string
  deleteTooltip: string
}

function TreeNodeActions({
  onMove,
  onRename,
  onDelete,
  moveAriaLabel,
  renameAriaLabel,
  deleteAriaLabel,
  moveTooltip,
  renameTooltip,
  deleteTooltip,
}: TreeNodeActionsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pr: 0.5 }}>
      <Tooltip title={moveTooltip}>
        <IconButton size="small" aria-label={moveAriaLabel} onClick={onMove}>
          <DriveFileMoveOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={renameTooltip}>
        <IconButton size="small" aria-label={renameAriaLabel} onClick={onRename}>
          <DriveFileRenameOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteTooltip}>
        <IconButton size="small" color="error" aria-label={deleteAriaLabel} onClick={onDelete}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

interface FolderTreeNodeProps {
  folderId: NodeId
  state: DataRoomState
  selectedFolderId: NodeId | null
  onSelectFolder: (folderId: NodeId) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  selectedContentItemIds: NodeId[]
  indeterminateFolderIds: NodeId[]
  onToggleContentItemSelection: (itemId: NodeId) => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId, draggedItemId?: NodeId) => void
  renderFolderName: (name: string) => string
  collapsedNodeIds: Set<NodeId>
  onToggleNode: (nodeId: NodeId) => void
  depth?: number
  visited?: Set<NodeId>
}

function FolderTreeNode({
  folderId,
  state,
  selectedFolderId,
  onSelectFolder,
  onOpenMoveFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  selectedContentItemIds,
  indeterminateFolderIds,
  onToggleContentItemSelection,
  onStartDragMove,
  onEndDragMove,
  dragMoveActive,
  dragMoveTargetFolderId,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  renderFolderName,
  collapsedNodeIds,
  onToggleNode,
  depth = 0,
  visited = new Set<NodeId>(),
}: FolderTreeNodeProps) {
  const { t } = useTranslation()

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
  const hasChildren = children.length > 0
  const isExpanded = !collapsedNodeIds.has(folder.id)
  const folderDisplayName = renderFolderName(folder.name)
  const isSelected = selectedContentItemIds.includes(folder.id)
  const isIndeterminate = indeterminateFolderIds.includes(folder.id)
  const isDragTarget = dragMoveTargetFolderId === folder.id
  const canDrop = onCanDropOnFolder(folder.id)
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (canDrop) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', pl: depth * 2 }}>
        <TreeExpandToggle
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          ariaLabel={`${isExpanded ? 'Collapse' : 'Expand'} folder ${folderDisplayName}`}
          onToggle={(event) => {
            event.stopPropagation()
            onToggleNode(folder.id)
          }}
        />
        <ListItemButton
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', folder.id)
            onStartDragMove(folder.id)
          }}
          onDragEnd={onEndDragMove}
          selected={selectedFolderId === folder.id}
          onDragEnter={() => {
            if (dragMoveActive) {
              onSetDragMoveTargetFolder(folder.id)
            }
          }}
          onDragLeave={() => {
            if (dragMoveActive && isDragTarget) {
              onSetDragMoveTargetFolder(null)
            }
          }}
          onDragOver={handleDragOver}
          onDrop={(event) => {
            event.preventDefault()
            const draggedItemId = event.dataTransfer.getData('text/plain') || undefined
            onDropOnFolder(folder.id, draggedItemId)
          }}
          onClick={() => onSelectFolder(folder.id)}
          sx={{
            pl: 1,
            minWidth: 0,
            flex: 1,
            userSelect: 'none',
            cursor: dragMoveActive
              ? isDragTarget
                ? canDrop
                  ? 'move'
                  : 'not-allowed'
                : 'default'
              : isSelected
                ? 'move'
                : 'grab',
            '&:hover': {
              cursor: dragMoveActive
                ? isDragTarget
                  ? canDrop
                    ? 'move'
                    : 'not-allowed'
                  : 'default'
                : isSelected
                  ? 'move'
                  : 'grab',
            },
            '&:active': {
              cursor: 'grabbing',
            },
            outline: dragMoveActive && isDragTarget ? '1px dashed' : 'none',
            outlineColor: canDrop ? 'success.main' : 'error.main',
            bgcolor: dragMoveActive && isDragTarget ? (canDrop ? 'rgba(46,125,50,0.12)' : 'action.hover') : undefined,
          }}
          title={folderDisplayName}
          aria-label={folderDisplayName}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <Checkbox
                  size="small"
                  checked={isSelected}
                  indeterminate={isIndeterminate}
                  sx={{
                    '&.MuiCheckbox-indeterminate': {
                      color: 'text.disabled',
                    },
                  }}
                  inputProps={{ 'aria-label': t('dataroomSelectionSelectItemAria', { name: folderDisplayName }) }}
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                  onChange={() => onToggleContentItemSelection(folder.id)}
                />
                <FolderOutlinedIcon fontSize="small" />
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: isIndeterminate ? 'text.secondary' : 'inherit',
                  }}
                >
                  {formatPathForDisplay(folderDisplayName)}
                </Box>
              </Box>
            }
            primaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
        <TreeNodeActions
          moveAriaLabel={`${t('dataroomAriaMoveFolder', { name: folderDisplayName })} in tree`}
          renameAriaLabel={`${t('dataroomAriaRenameFolder', { name: folderDisplayName })} in tree`}
          deleteAriaLabel={`${t('dataroomAriaDeleteFolder', { name: folderDisplayName })} in tree`}
          moveTooltip={t('dataroomActionMove')}
          renameTooltip={t('dataroomActionRename')}
          deleteTooltip={t('dataroomActionDelete')}
          onMove={(event) => {
            event.stopPropagation()
            onOpenMoveFolder(folder)
          }}
          onRename={(event) => {
            event.stopPropagation()
            onOpenRenameFolder(folder)
          }}
          onDelete={(event) => {
            event.stopPropagation()
            onOpenDeleteFolder(folder)
          }}
        />
      </Box>
      {isExpanded
        ? children.map((childFolder) => (
            <FolderTreeNode
              key={childFolder.id}
              folderId={childFolder.id}
              state={state}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onOpenMoveFolder={onOpenMoveFolder}
              onOpenRenameFolder={onOpenRenameFolder}
              onOpenDeleteFolder={onOpenDeleteFolder}
              selectedContentItemIds={selectedContentItemIds}
              indeterminateFolderIds={indeterminateFolderIds}
              onToggleContentItemSelection={onToggleContentItemSelection}
              onStartDragMove={onStartDragMove}
              onEndDragMove={onEndDragMove}
              dragMoveActive={dragMoveActive}
              dragMoveTargetFolderId={dragMoveTargetFolderId}
              onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
              onCanDropOnFolder={onCanDropOnFolder}
              onDropOnFolder={onDropOnFolder}
              renderFolderName={renderFolderName}
              collapsedNodeIds={collapsedNodeIds}
              onToggleNode={onToggleNode}
              depth={depth + 1}
              visited={nextVisited}
            />
          ))
        : null}
    </>
  )
}

interface DataRoomTreeNodeProps {
  dataRoom: DataRoom
  state: DataRoomState
  selectedFolderId: NodeId | null
  onSelectFolder: (folderId: NodeId) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  selectedContentItemIds: NodeId[]
  indeterminateFolderIds: NodeId[]
  onToggleContentItemSelection: (itemId: NodeId) => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId, draggedItemId?: NodeId) => void
  renderFolderName: (name: string) => string
  collapsedNodeIds: Set<NodeId>
  onToggleNode: (nodeId: NodeId) => void
}

export function DataRoomTreeNode({
  dataRoom,
  state,
  selectedFolderId,
  onSelectFolder,
  onOpenMoveFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  selectedContentItemIds,
  indeterminateFolderIds,
  onToggleContentItemSelection,
  onStartDragMove,
  onEndDragMove,
  dragMoveActive,
  dragMoveTargetFolderId,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  renderFolderName,
  collapsedNodeIds,
  onToggleNode,
}: DataRoomTreeNodeProps) {
  const rootFolder = state.foldersById[dataRoom.rootFolderId]
  const rootChildren = rootFolder ? getFolderChildren(state, rootFolder) : []

  return (
    <>
      {rootChildren.map((childFolder) => (
        <FolderTreeNode
          key={childFolder.id}
          folderId={childFolder.id}
          state={state}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onOpenMoveFolder={onOpenMoveFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          selectedContentItemIds={selectedContentItemIds}
          indeterminateFolderIds={indeterminateFolderIds}
          onToggleContentItemSelection={onToggleContentItemSelection}
          onStartDragMove={onStartDragMove}
          onEndDragMove={onEndDragMove}
          dragMoveActive={dragMoveActive}
          dragMoveTargetFolderId={dragMoveTargetFolderId}
          onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
          onCanDropOnFolder={onCanDropOnFolder}
          onDropOnFolder={onDropOnFolder}
          renderFolderName={renderFolderName}
          collapsedNodeIds={collapsedNodeIds}
          onToggleNode={onToggleNode}
          depth={0}
        />
      ))}
    </>
  )
}
