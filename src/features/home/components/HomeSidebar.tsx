import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../../dataroom/model'
import { useSidebarMoveConfirm } from '../hooks/useSidebarMoveConfirm'
import { useSidebarTreeCollapse } from '../hooks/useSidebarTreeCollapse'
import { HomeSidebarDataRoomSelect } from './sidebar/HomeSidebarDataRoomSelect'
import { HomeSidebarHeaderActions } from './sidebar/HomeSidebarHeaderActions'
import { HomeSidebarMoveConfirmDialog } from './sidebar/HomeSidebarMoveConfirmDialog'
import { HomeSidebarTree } from './sidebar/HomeSidebarTree'

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
  const pendingDestinationFolderName = getPendingDestinationFolderName(resolveDisplayName)

  return (
    <Box component="aside" sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}>
      <HomeSidebarHeaderActions
        activeDataRoom={activeDataRoom}
        canDeleteActiveDataRoom={canDeleteActiveDataRoom}
        onCreateDataRoom={onCreateDataRoom}
        onRenameDataRoom={onRenameDataRoom}
        onDeleteDataRoom={onDeleteDataRoom}
      />

      <HomeSidebarDataRoomSelect
        dataRooms={dataRooms}
        activeDataRoomId={activeDataRoom?.id}
        selectedDataRoomId={selectedDataRoomId}
        resolveDisplayName={resolveDisplayName}
        onSelectDataRoom={onSelectDataRoom}
      />

      <Divider sx={{ my: 2 }} />

      <HomeSidebarTree
        dataRooms={visibleDataRooms}
        entities={entities}
        selectedFolderId={selectedFolderId}
        checkedContentItemIds={checkedContentItemIds}
        indeterminateFolderIds={indeterminateFolderIds}
        dragMoveActive={dragMoveActive}
        dragMoveTargetFolderId={dragMoveTargetFolderId}
        collapsedNodeIds={collapsedNodeIds}
        resolveDisplayName={resolveDisplayName}
        onSelectFolder={onSelectFolder}
        onOpenMoveFolder={onOpenMoveFolder}
        onOpenRenameFolder={onOpenRenameFolder}
        onOpenDeleteFolder={onOpenDeleteFolder}
        onToggleContentItemSelection={onToggleContentItemSelection}
        onStartDragMove={onStartDragMove}
        onEndDragMove={onEndDragMove}
        onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
        onCanDropOnFolder={onCanDropOnFolder}
        onDropOnFolder={openMoveConfirmDialog}
        onToggleNode={toggleNode}
      />

      <HomeSidebarMoveConfirmDialog
        open={moveConfirmState.open}
        itemCount={moveConfirmState.itemIds.length}
        pendingDestinationFolderName={pendingDestinationFolderName}
        onClose={closeMoveConfirmDialog}
        onConfirm={confirmMove}
      />
    </Box>
  )
}
