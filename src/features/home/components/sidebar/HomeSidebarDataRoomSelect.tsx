import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { DataRoom, NodeId } from '../../../dataroom/model'
import { truncateMiddle } from '../../services/formatters'

interface HomeSidebarDataRoomSelectProps {
  dataRooms: DataRoom[]
  activeDataRoomId?: NodeId
  selectedDataRoomId: NodeId | null
  resolveDisplayName: (value: string) => string
  onSelectDataRoom: (dataRoomId: NodeId) => void
}

export function HomeSidebarDataRoomSelect({
  dataRooms,
  activeDataRoomId,
  selectedDataRoomId,
  resolveDisplayName,
  onSelectDataRoom,
}: HomeSidebarDataRoomSelectProps) {
  const { t } = useTranslation()

  const selectWorkingDataRoom = (event: SelectChangeEvent<NodeId>) => {
    const nextDataRoomId = event.target.value as NodeId
    if (nextDataRoomId && nextDataRoomId !== selectedDataRoomId) {
      onSelectDataRoom(nextDataRoomId)
    }
  }

  return (
    <Select
      fullWidth
      size="small"
      value={activeDataRoomId ?? ''}
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
  )
}
