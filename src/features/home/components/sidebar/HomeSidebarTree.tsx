import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../../../dataroom/model'
import { DataRoomTreeNode } from '../../FolderTree'

interface HomeSidebarTreeProps {
  dataRooms: DataRoom[]
  entities: DataRoomState
  selectedFolderId: NodeId | null
  checkedContentItemIds: NodeId[]
  indeterminateFolderIds: NodeId[]
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  collapsedNodeIds: Set<NodeId>
  resolveDisplayName: (value: string) => string
  onSelectFolder: (folderId: NodeId) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onToggleContentItemSelection: (itemId: NodeId) => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId) => void
  onToggleNode: (nodeId: NodeId) => void
}

export function HomeSidebarTree({
  dataRooms,
  entities,
  selectedFolderId,
  checkedContentItemIds,
  indeterminateFolderIds,
  dragMoveActive,
  dragMoveTargetFolderId,
  collapsedNodeIds,
  resolveDisplayName,
  onSelectFolder,
  onOpenMoveFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onToggleContentItemSelection,
  onStartDragMove,
  onEndDragMove,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  onToggleNode,
}: HomeSidebarTreeProps) {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
        {t('dataroomFolderTreeTitle')}
      </Typography>
      <List dense disablePadding aria-label={t('dataroomFolderTreeTitle')}>
        {dataRooms.map((dataRoom) => (
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
            onDropOnFolder={onDropOnFolder}
            renderFolderName={resolveDisplayName}
            collapsedNodeIds={collapsedNodeIds}
            onToggleNode={onToggleNode}
          />
        ))}
      </List>
    </>
  )
}
