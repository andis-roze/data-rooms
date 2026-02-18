import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { DataRoom, DataRoomState, NodeId } from '../../dataroom/model'
import { DataRoomTreeNode } from '../FolderTree'

interface HomeSidebarProps {
  entities: DataRoomState
  dataRooms: DataRoom[]
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
  canDeleteActiveDataRoom: boolean
  onCreateDataRoom: () => void
  onRenameDataRoom: () => void
  onDeleteDataRoom: () => void
  onSelectDataRoom: (dataRoomId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
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
  resolveDisplayName,
}: HomeSidebarProps) {
  const { t } = useTranslation()

  return (
    <Box component="aside" sx={{ width: { md: 320 }, borderRight: { md: '1px solid' }, borderColor: 'divider', p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('dataroomSidebarTitle')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1} sx={{ mb: 1.5 }}>
        <Button size="small" variant="contained" onClick={onCreateDataRoom}>
          {t('dataroomActionCreateDataRoom')}
        </Button>
        <Button size="small" variant="outlined" onClick={onRenameDataRoom}>
          {t('dataroomActionRenameDataRoom')}
        </Button>
        <Button size="small" variant="outlined" color="error" disabled={!canDeleteActiveDataRoom} onClick={onDeleteDataRoom}>
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
            renderDataRoomName={resolveDisplayName}
            renderFolderName={resolveDisplayName}
          />
        ))}
      </List>
    </Box>
  )
}
