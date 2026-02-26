import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../../dataroom/model'
import { truncateMiddle } from '../services/formatters'
import { HomeSidebarHeaderActions } from './sidebar/HomeSidebarHeaderActions'

export interface HomeSidebarState {
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

export interface HomeSidebarHandlers {
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
  state: HomeSidebarState
  handlers: HomeSidebarHandlers
}

export function HomeSidebar({
  state,
  handlers,
}: HomeSidebarProps) {
  const { t } = useTranslation()
  const {
    dataRooms,
    selectedDataRoomId,
    canDeleteActiveDataRoom,
    resolveDisplayName,
  } = state

  const {
    onCreateDataRoom,
    onRenameDataRoom,
    onDeleteDataRoom,
    onSelectDataRoom,
  } = handlers

  const activeDataRoom =
    (selectedDataRoomId ? dataRooms.find((dataRoom) => dataRoom.id === selectedDataRoomId) : undefined) ?? dataRooms[0]

  return (
    <Box component="aside" sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}>
      <HomeSidebarHeaderActions
        activeDataRoom={activeDataRoom}
        canDeleteActiveDataRoom={canDeleteActiveDataRoom}
        onCreateDataRoom={onCreateDataRoom}
        onRenameDataRoom={onRenameDataRoom}
        onDeleteDataRoom={onDeleteDataRoom}
      />

      <Divider sx={{ my: 2 }} />

      <List dense disablePadding aria-label={t('dataroomSidebarTitle')}>
        {dataRooms.map((dataRoom) => {
          const dataRoomName = resolveDisplayName(dataRoom.name)
          return (
            <ListItemButton
              key={dataRoom.id}
              selected={activeDataRoom?.id === dataRoom.id}
              onClick={() => onSelectDataRoom(dataRoom.id)}
              aria-label={dataRoomName}
            >
              <ListItemText
                primary={(
                  <Tooltip title={dataRoomName} placement="right">
                    <Typography
                      component="span"
                      sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {truncateMiddle(dataRoomName, 42)}
                    </Typography>
                  </Tooltip>
                )}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
