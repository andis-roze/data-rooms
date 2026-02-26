import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import type { DragEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { FileNode, NodeId } from '../../dataroom/model'
import { formatPathForDisplay, formatUpdatedAt } from '../services/formatters'

interface FileRowProps {
  itemId: string
  file: FileNode
  rowGridTemplate: string
  locale: string
  selected: boolean
  isHighlighted: boolean
  dragMoveActive: boolean
  onDragMoveStart: (itemId: NodeId) => void
  onDragMoveEnd: () => void
  onToggleSelect: (itemId: NodeId) => void
  onOpenViewFile: (file: FileNode) => void
  onOpenRenameFile: (file: FileNode) => void
  onOpenDeleteFile: (file: FileNode) => void
  onOpenMoveFile: (file: FileNode) => void
}

const mobileGridTemplate = '36px minmax(0,1fr) auto'
const MAX_DRAG_PREVIEW_NAMES = 3

const actionGridTemplate = {
  xs: 'repeat(3, max-content)',
  md: 'repeat(3, max-content)',
}

const getSelectedFileNamesInList = (currentRow: HTMLLIElement) => {
  const currentList = currentRow.closest('[role="list"]')
  if (!currentList) {
    return []
  }

  return Array.from(currentList.querySelectorAll<HTMLElement>('[data-drag-file-name][data-content-selected="true"]'))
    .map((element) => element.dataset.dragFileName)
    .filter((name): name is string => Boolean(name))
}

const createDragPreviewElement = (names: string[]) => {
  const previewContainer = document.createElement('div')
  previewContainer.style.position = 'fixed'
  previewContainer.style.top = '-9999px'
  previewContainer.style.left = '-9999px'
  previewContainer.style.pointerEvents = 'none'
  previewContainer.style.background = 'rgba(33, 33, 33, 0.92)'
  previewContainer.style.color = '#fff'
  previewContainer.style.padding = '8px 10px'
  previewContainer.style.borderRadius = '8px'
  previewContainer.style.fontSize = '12px'
  previewContainer.style.lineHeight = '1.35'
  previewContainer.style.maxWidth = '280px'
  previewContainer.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.35)'

  const visibleNames = names.slice(0, MAX_DRAG_PREVIEW_NAMES)
  visibleNames.forEach((name) => {
    const line = document.createElement('div')
    line.textContent = name
    previewContainer.appendChild(line)
  })

  if (names.length > MAX_DRAG_PREVIEW_NAMES) {
    const summary = document.createElement('div')
    summary.textContent = `+${names.length - MAX_DRAG_PREVIEW_NAMES} more`
    summary.style.opacity = '0.85'
    previewContainer.appendChild(summary)
  }

  return previewContainer
}

export function FileRow({
  itemId,
  file,
  rowGridTemplate,
  locale,
  selected,
  isHighlighted,
  dragMoveActive,
  onDragMoveStart,
  onDragMoveEnd,
  onToggleSelect,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
  onOpenMoveFile,
}: FileRowProps) {
  const { t } = useTranslation()
  const idleHoverCursor = selected ? 'move' : 'grab'
  const activeCursor = dragMoveActive ? 'grabbing' : idleHoverCursor

  return (
    <ListItem
      key={itemId}
      disablePadding
      draggable
      onDragStart={(event: DragEvent<HTMLLIElement>) => {
        const previewNames = selected ? getSelectedFileNamesInList(event.currentTarget) : []
        const namesToPreview = previewNames.length > 0 ? previewNames : [file.name]
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', file.id)
        if (typeof event.dataTransfer.setDragImage === 'function') {
          const previewElement = createDragPreviewElement(namesToPreview)
          document.body.appendChild(previewElement)
          event.dataTransfer.setDragImage(previewElement, 12, 12)
          setTimeout(() => {
            previewElement.remove()
          }, 0)
        }
        onDragMoveStart(file.id)
      }}
      onDragEnd={onDragMoveEnd}
      data-drag-file-name={file.name}
      data-content-selected={selected ? 'true' : 'false'}
      sx={{
        px: 2,
        py: 1,
        bgcolor: isHighlighted ? 'action.hover' : undefined,
        userSelect: 'none',
        cursor: activeCursor,
        '&:hover': { cursor: activeCursor },
        '&:active': { cursor: 'grabbing' },
      }}
      data-row-highlighted={isHighlighted ? 'true' : 'false'}
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
          <Checkbox
            size="small"
            checked={selected}
            inputProps={{ 'aria-label': t('dataroomSelectionSelectItemAria', { name: file.name }) }}
            onChange={() => onToggleSelect(file.id)}
          />
        </Box>
        <Box
          sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center' }}
          title={t('dataroomFileItemType')}
          aria-label={t('dataroomFileItemType')}
        >
          <DescriptionOutlinedIcon fontSize="small" color="action" />
        </Box>
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0, minWidth: 0, textTransform: 'none' }}
          aria-label={t('dataroomAriaViewFile', { name: file.name })}
          onClick={() => onOpenViewFile(file)}
          title={file.name}
        >
          <Typography noWrap>{formatPathForDisplay(file.name)}</Typography>
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          {formatUpdatedAt(file.updatedAt, locale)}
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
          <Tooltip title={t('dataroomActionMove')}>
            <IconButton size="small" aria-label={t('dataroomAriaMoveFile', { name: file.name })} onClick={() => onOpenMoveFile(file)}>
              <DriveFileMoveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('dataroomActionRenameFile')}>
            <IconButton
              size="small"
              aria-label={t('dataroomAriaRenameFile', { name: file.name })}
              onClick={() => onOpenRenameFile(file)}
            >
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('dataroomActionDeleteFile')}>
            <IconButton
              size="small"
              color="error"
              aria-label={t('dataroomAriaDeleteFile', { name: file.name })}
              onClick={() => onOpenDeleteFile(file)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </ListItem>
  )
}
