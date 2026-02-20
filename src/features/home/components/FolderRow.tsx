import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import type { DragEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../dataroom/model'
import { formatPathForDisplay, formatUpdatedAt } from '../services/formatters'

interface FolderRowProps {
  itemId: string
  folder: Folder
  displayName?: string
  isParentNavigation?: boolean
  rowGridTemplate: string
  locale: string
  resolveDisplayName: (value: string) => string
  selected: boolean
  indeterminate: boolean
  dragMoveActive: boolean
  dragMoveTargeted: boolean
  canDrop: boolean
  onDragMoveStart: (itemId: NodeId) => void
  onDragMoveEnd: () => void
  onDragMoveEnterFolder: (folderId: NodeId | null) => void
  onDragMoveLeaveFolder: () => void
  onDragMoveOver: (event: DragEvent<HTMLLIElement>) => void
  onDropOnFolder: (folderId: NodeId) => void
  onToggleSelect: (itemId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenMoveFolder: (folder: Folder) => void
}

const mobileGridTemplate = '36px minmax(0,1fr) auto'

const actionGridTemplate = {
  xs: 'repeat(3, max-content)',
  md: 'repeat(3, max-content)',
}

export function FolderRow({
  itemId,
  folder,
  displayName,
  isParentNavigation,
  rowGridTemplate,
  locale,
  resolveDisplayName,
  selected,
  indeterminate,
  dragMoveActive,
  dragMoveTargeted,
  canDrop,
  onDragMoveStart,
  onDragMoveEnd,
  onDragMoveEnterFolder,
  onDragMoveLeaveFolder,
  onDragMoveOver,
  onDropOnFolder,
  onToggleSelect,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenMoveFolder,
}: FolderRowProps) {
  const { t } = useTranslation()

  return (
    <ListItem
      key={itemId}
      disablePadding
      draggable={!isParentNavigation}
      onDragStart={(event) => {
        if (isParentNavigation) {
          return
        }
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', folder.id)
        onDragMoveStart(folder.id)
      }}
      onDragEnd={onDragMoveEnd}
      onDragEnter={() => {
        if (dragMoveActive) {
          onDragMoveEnterFolder(folder.id)
        }
      }}
      onDragLeave={onDragMoveLeaveFolder}
      onDragOver={onDragMoveOver}
      onDrop={(event) => {
        event.preventDefault()
        onDropOnFolder(folder.id)
      }}
      sx={{
        px: 2,
        py: 1,
        cursor: !isParentNavigation ? 'grab' : undefined,
        '&:active': !isParentNavigation ? { cursor: 'grabbing' } : undefined,
        outline: dragMoveActive && dragMoveTargeted ? '1px dashed' : 'none',
        outlineColor: canDrop ? 'success.main' : 'error.main',
        bgcolor: dragMoveActive && dragMoveTargeted ? (canDrop ? 'rgba(46,125,50,0.12)' : 'action.hover') : undefined,
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: mobileGridTemplate, md: rowGridTemplate },
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {!isParentNavigation ? (
            <Checkbox
              size="small"
              checked={selected}
              indeterminate={indeterminate}
              sx={{
                '&.MuiCheckbox-indeterminate': {
                  color: 'text.disabled',
                },
              }}
              inputProps={{ 'aria-label': t('dataroomSelectionSelectItemAria', { name: resolveDisplayName(folder.name) }) }}
              onChange={() => onToggleSelect(folder.id)}
            />
          ) : null}
        </Box>
        <Box
          sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center' }}
          title={t('dataroomFolderItemType')}
          aria-label={t('dataroomFolderItemType')}
        >
          <FolderOutlinedIcon fontSize="small" color="action" />
        </Box>
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
          aria-label={t('dataroomAriaOpenFolder', { name: resolveDisplayName(folder.name) })}
          onClick={() => onSelectFolder(folder.id)}
          title={displayName ?? resolveDisplayName(folder.name)}
        >
          <Typography noWrap color={indeterminate ? 'text.secondary' : 'inherit'}>
            {formatPathForDisplay(displayName ?? resolveDisplayName(folder.name))}
          </Typography>
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          {formatUpdatedAt(folder.updatedAt, locale)}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: actionGridTemplate,
            gap: 0.5,
            justifySelf: 'end',
            justifyItems: { xs: 'end', md: 'stretch' },
            width: { xs: 'auto', md: '100%' },
          }}
        >
          {isParentNavigation ? (
            <>
              <Box />
              <Box />
              <Box />
            </>
          ) : (
            <>
              <Tooltip title={t('dataroomActionMove')}>
                <IconButton
                  size="small"
                  aria-label={t('dataroomAriaMoveFolder', { name: resolveDisplayName(folder.name) })}
                  onClick={() => onOpenMoveFolder(folder)}
                >
                  <DriveFileMoveOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('dataroomActionRename')}>
                <IconButton
                  size="small"
                  aria-label={t('dataroomAriaRenameFolder', { name: resolveDisplayName(folder.name) })}
                  onClick={() => onOpenRenameFolder(folder)}
                >
                  <DriveFileRenameOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('dataroomActionDelete')}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={t('dataroomAriaDeleteFolder', { name: resolveDisplayName(folder.name) })}
                  onClick={() => onOpenDeleteFolder(folder)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </ListItem>
  )
}
