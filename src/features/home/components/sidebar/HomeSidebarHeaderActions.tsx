import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useTranslation } from 'react-i18next'
import type { DataRoom } from '../../../dataroom/model'
import { useSidebarActionsMenu } from './useSidebarActionsMenu'

interface HomeSidebarHeaderActionsProps {
  activeDataRoom?: DataRoom
  canDeleteActiveDataRoom: boolean
  onCreateDataRoom: () => void
  onRenameDataRoom: (dataRoom?: DataRoom) => void
  onDeleteDataRoom: (dataRoom?: DataRoom) => void
}

export function HomeSidebarHeaderActions({
  activeDataRoom,
  canDeleteActiveDataRoom,
  onCreateDataRoom,
  onRenameDataRoom,
  onDeleteDataRoom,
}: HomeSidebarHeaderActionsProps) {
  const { t } = useTranslation()
  const {
    menuAnchorEl,
    menuAnchorReference,
    menuAnchorPosition,
    isActionsMenuOpen,
    openActionsMenu,
    closeActionsMenu,
  } = useSidebarActionsMenu()

  return (
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
  )
}
