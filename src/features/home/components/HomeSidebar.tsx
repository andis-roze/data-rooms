import { type MouseEvent, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../../dataroom/model'
import { DataRoomTreeNode } from '../FolderTree'
import { useSidebarMoveConfirm } from '../hooks/useSidebarMoveConfirm'
import { useSidebarTreeCollapse } from '../hooks/useSidebarTreeCollapse'
import { truncateMiddle } from '../services/formatters'

interface HomeSidebarStateProps {
  entities: DataRoomState
  dataRooms: DataRoom[]
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  selectedContentItemIds: NodeId[]
  checkedContentItemIds: NodeId[]
  indeterminateFolderIds: NodeId[]
  dragMoveActive: boolean
  dragMoveItemIds: NodeId[]
  dragMoveTargetFolderId: NodeId | null
  canDeleteActiveDataRoom: boolean
  resolveDisplayName: (value: string) => string
}

interface HomeSidebarHandlerProps {
  onCreateDataRoom: () => void
  onRenameDataRoom: (dataRoom?: DataRoom) => void
  onDeleteDataRoom: (dataRoom?: DataRoom) => void
  onSelectDataRoom: (dataRoomId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onToggleContentItemSelection: (itemId: NodeId) => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onMoveItemsToFolder: (itemIds: NodeId[], folderId: NodeId) => void
}

interface HomeSidebarProps {
  state: HomeSidebarStateProps
  handlers: HomeSidebarHandlerProps
}

export function HomeSidebar({
  state,
  handlers,
}: HomeSidebarProps) {
  const {
  entities,
  dataRooms,
  selectedDataRoomId,
  selectedFolderId,
  selectedContentItemIds,
  checkedContentItemIds,
  indeterminateFolderIds,
  dragMoveActive,
  dragMoveItemIds,
  dragMoveTargetFolderId,
  canDeleteActiveDataRoom,
  resolveDisplayName,
  } = state

  const {
  onCreateDataRoom,
  onRenameDataRoom,
  onDeleteDataRoom,
  onSelectDataRoom,
  onSelectFolder,
  onOpenMoveFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onToggleContentItemSelection,
  onStartDragMove,
  onEndDragMove,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onMoveItemsToFolder,
  } = handlers

  const { t } = useTranslation()
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuAnchorReference, setMenuAnchorReference] = useState<'anchorEl' | 'anchorPosition'>('anchorEl')
  const [menuAnchorPosition, setMenuAnchorPosition] = useState<{ top: number; left: number } | undefined>(undefined)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)

  const { collapsedNodeIds, toggleNode } = useSidebarTreeCollapse({
    entities,
    selectedDataRoomId,
    selectedFolderId,
  })

  const {
    moveConfirmState,
    closeMoveConfirmDialog,
    openMoveConfirmDialog,
    confirmMove,
    getPendingDestinationFolderName,
  } = useSidebarMoveConfirm({
    entities,
    selectedContentItemIds,
    dragMoveItemIds,
    onCanDropOnFolder,
    onMoveItemsToFolder,
  })

  const activeDataRoom =
    (selectedDataRoomId ? dataRooms.find((dataRoom) => dataRoom.id === selectedDataRoomId) : undefined) ?? dataRooms[0]
  const visibleDataRooms = activeDataRoom ? [activeDataRoom] : []

  const openActionsMenu = (event: MouseEvent<HTMLElement>) => {
    const anchorElement = event.currentTarget
    const rect = anchorElement.getBoundingClientRect()
    const hasLayoutBox = rect.width > 0 || rect.height > 0

    if (hasLayoutBox) {
      setMenuAnchorEl(anchorElement)
      setMenuAnchorReference('anchorEl')
      setMenuAnchorPosition(undefined)
    } else {
      setMenuAnchorEl(null)
      setMenuAnchorReference('anchorPosition')
      setMenuAnchorPosition({
        top: Math.max(event.clientY, 0),
        left: Math.max(event.clientX, 0),
      })
    }

    setIsActionsMenuOpen(true)
  }

  const closeActionsMenu = () => {
    setIsActionsMenuOpen(false)
  }

  const selectWorkingDataRoom = (event: SelectChangeEvent<NodeId>) => {
    const nextDataRoomId = event.target.value as NodeId
    if (nextDataRoomId && nextDataRoomId !== selectedDataRoomId) {
      onSelectDataRoom(nextDataRoomId)
    }
  }

  const pendingDestinationFolderName = getPendingDestinationFolderName(resolveDisplayName)

  return (
    <Box component="aside" sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('dataroomSidebarTitle')}
        </Typography>
        <IconButton
          size="small"
          aria-label={t('dataroomColumnActions')}
          onClick={openActionsMenu}
          disabled={!activeDataRoom}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          anchorReference={menuAnchorReference}
          anchorPosition={menuAnchorPosition}
          open={isActionsMenuOpen}
          onClose={closeActionsMenu}
        >
          <MenuItem
            onClick={() => {
              closeActionsMenu()
              onCreateDataRoom()
            }}
          >
            {t('dataroomActionCreateDataRoom')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeActionsMenu()
              onRenameDataRoom(activeDataRoom)
            }}
            disabled={!activeDataRoom}
          >
            {t('dataroomActionRenameDataRoom')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeActionsMenu()
              onDeleteDataRoom(activeDataRoom)
            }}
            disabled={!canDeleteActiveDataRoom || !activeDataRoom}
          >
            {t('dataroomActionDeleteDataRoom')}
          </MenuItem>
        </Menu>
      </Box>

      <Select
        fullWidth
        size="small"
        value={activeDataRoom?.id ?? ''}
        onChange={selectWorkingDataRoom}
        displayEmpty
        aria-label={t('dataroomSidebarTitle')}
        sx={{ mb: 1.5 }}
      >
        {dataRooms.map((dataRoom) => (
          <MenuItem key={dataRoom.id} value={dataRoom.id}>
            <Tooltip title={resolveDisplayName(dataRoom.name)} placement="right">
              <Typography
                component="span"
                sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {truncateMiddle(resolveDisplayName(dataRoom.name), 42)}
              </Typography>
            </Tooltip>
          </MenuItem>
        ))}
      </Select>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
        {t('dataroomFolderTreeTitle')}
      </Typography>
      <List dense disablePadding aria-label={t('dataroomFolderTreeTitle')}>
        {visibleDataRooms.map((dataRoom) => (
          <DataRoomTreeNode
            key={dataRoom.id}
            dataRoom={dataRoom}
            state={entities}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onOpenMoveFolder={onOpenMoveFolder}
            onOpenRenameFolder={onOpenRenameFolder}
            onOpenDeleteFolder={onOpenDeleteFolder}
            selectedContentItemIds={checkedContentItemIds}
            indeterminateFolderIds={indeterminateFolderIds}
            onToggleContentItemSelection={onToggleContentItemSelection}
            onStartDragMove={onStartDragMove}
            onEndDragMove={onEndDragMove}
            dragMoveActive={dragMoveActive}
            dragMoveTargetFolderId={dragMoveTargetFolderId}
            onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
            onCanDropOnFolder={onCanDropOnFolder}
            onDropOnFolder={openMoveConfirmDialog}
            renderFolderName={resolveDisplayName}
            collapsedNodeIds={collapsedNodeIds}
            onToggleNode={toggleNode}
          />
        ))}
      </List>
      <Dialog open={moveConfirmState.open} onClose={closeMoveConfirmDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogMoveTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomMoveSelectedQuestion', { count: moveConfirmState.itemIds.length })}</Typography>
          {pendingDestinationFolderName ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {`${t('dataroomFieldDestinationFolder')}: ${pendingDestinationFolderName}`}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMoveConfirmDialog}>{t('dataroomActionCancel')}</Button>
          <Button variant="contained" onClick={confirmMove}>
            {t('dataroomActionMove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
