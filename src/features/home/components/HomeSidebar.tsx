import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, Folder, NodeId } from '../../dataroom/model'
import { DataRoomTreeNode } from '../FolderTree'

interface HomeSidebarProps {
  entities: DataRoomState
  dataRooms: DataRoom[]
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  canDeleteActiveDataRoom: boolean
  onCreateDataRoom: () => void
  onRenameDataRoom: (dataRoom?: DataRoom) => void
  onDeleteDataRoom: (dataRoom?: DataRoom) => void
  onSelectDataRoom: (dataRoomId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  resolveDisplayName: (value: string) => string
}

export function HomeSidebar({
  entities,
  dataRooms,
  selectedDataRoomId,
  selectedFolderId,
  canDeleteActiveDataRoom,
  onCreateDataRoom,
  onRenameDataRoom,
  onDeleteDataRoom,
  onSelectDataRoom,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  resolveDisplayName,
}: HomeSidebarProps) {
  const { t } = useTranslation()
  const [collapseOverrides, setCollapseOverrides] = useState<Map<NodeId, boolean>>(new Map())

  const autoCollapsedNodeIds = useMemo(() => {
    if (!selectedDataRoomId || !selectedFolderId) {
      return new Set<NodeId>()
    }

    const selectedFolder = entities.foldersById[selectedFolderId]
    if (!selectedFolder) {
      return new Set<NodeId>()
    }

    const requiredOpenNodeIds = new Set<NodeId>([selectedDataRoomId])
    let currentFolder = selectedFolder

    while (currentFolder.parentFolderId) {
      requiredOpenNodeIds.add(currentFolder.parentFolderId)
      const parentFolder = entities.foldersById[currentFolder.parentFolderId]
      if (!parentFolder) {
        break
      }
      currentFolder = parentFolder
    }

    const nextCollapsedNodeIds = new Set<NodeId>()

    for (const dataRoom of dataRooms) {
      const rootFolder = entities.foldersById[dataRoom.rootFolderId]
      if (rootFolder && rootFolder.childFolderIds.length > 0 && !requiredOpenNodeIds.has(dataRoom.id)) {
        nextCollapsedNodeIds.add(dataRoom.id)
      }
    }

    for (const folder of Object.values(entities.foldersById)) {
      if (folder.childFolderIds.length > 0 && !requiredOpenNodeIds.has(folder.id)) {
        nextCollapsedNodeIds.add(folder.id)
      }
    }

    return nextCollapsedNodeIds
  }, [dataRooms, entities.foldersById, selectedDataRoomId, selectedFolderId])

  const collapsedNodeIds = useMemo(() => {
    const next = new Set(autoCollapsedNodeIds)
    for (const [nodeId, isCollapsed] of collapseOverrides) {
      if (isCollapsed) {
        next.add(nodeId)
      } else {
        next.delete(nodeId)
      }
    }
    return next
  }, [autoCollapsedNodeIds, collapseOverrides])

  const toggleNode = (nodeId: NodeId) => {
    setCollapseOverrides((previous) => {
      const next = new Map(previous)
      const isCollapsed = previous.has(nodeId) ? previous.get(nodeId) === true : autoCollapsedNodeIds.has(nodeId)
      next.set(nodeId, !isCollapsed)
      return next
    })
  }

  return (
    <Box component="aside" sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('dataroomSidebarTitle')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1} sx={{ mb: 1.5 }}>
        <Button size="small" variant="contained" onClick={onCreateDataRoom}>
          {t('dataroomActionCreateDataRoom')}
        </Button>
        <Button size="small" variant="outlined" onClick={() => onRenameDataRoom()}>
          {t('dataroomActionRenameDataRoom')}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!canDeleteActiveDataRoom}
          onClick={() => onDeleteDataRoom()}
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
            onSelectDataRoom={onSelectDataRoom}
            onSelectFolder={onSelectFolder}
            onOpenRenameDataRoom={onRenameDataRoom}
            onOpenDeleteDataRoom={onDeleteDataRoom}
            onOpenRenameFolder={onOpenRenameFolder}
            onOpenDeleteFolder={onOpenDeleteFolder}
            renderDataRoomName={resolveDisplayName}
            renderFolderName={resolveDisplayName}
            collapsedNodeIds={collapsedNodeIds}
            onToggleNode={toggleNode}
          />
        ))}
      </List>
    </Box>
  )
}
