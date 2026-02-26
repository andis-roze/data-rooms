import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { SortField, SortState } from '../../types'

interface FolderContentTableHeaderProps {
  sortState: SortState
  onToggleSort: (field: SortField) => void
  rowGridTemplateXs: string
  rowGridTemplateDesktop: string
  areAllSelectableItemsSelected: boolean
  isSelectAllIndeterminate: boolean
  hasSelectableItems: boolean
  onToggleAllItemSelection: () => void
}

export function FolderContentTableHeader({
  sortState,
  onToggleSort,
  rowGridTemplateXs,
  rowGridTemplateDesktop,
  areAllSelectableItemsSelected,
  isSelectAllIndeterminate,
  hasSelectableItems,
  onToggleAllItemSelection,
}: FolderContentTableHeaderProps) {
  const { t } = useTranslation()
  const sortIndicator = (field: SortField) =>
    sortState.field === field ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕'
  const headerSeparatorSx = {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 2,
      right: 0,
      bottom: 2,
      width: '1px',
      backgroundColor: 'divider',
    },
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: rowGridTemplateXs, md: rowGridTemplateDesktop },
        gap: 1,
        alignItems: 'center',
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
        <Checkbox
          size="small"
          checked={areAllSelectableItemsSelected}
          indeterminate={isSelectAllIndeterminate}
          disabled={!hasSelectableItems}
          inputProps={{ 'aria-label': t('dataroomSelectionSelectAllAria') }}
          onChange={onToggleAllItemSelection}
        />
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'block' },
          minWidth: 0,
          pr: 1,
          ...headerSeparatorSx,
        }}
      >
        <Button
          size="small"
          color="inherit"
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            justifyContent: 'flex-start',
            px: 0.5,
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
          onClick={() => onToggleSort('type')}
          aria-label={t('dataroomSortByTypeAria')}
          aria-pressed={sortState.field === 'type'}
        >
          {t('dataroomColumnType')} {sortIndicator('type')}
        </Button>
      </Box>
      <Box
        sx={{
          position: 'relative',
          minWidth: 0,
          pr: { xs: 0, md: 1 },
          ...headerSeparatorSx,
          '&::after': {
            ...headerSeparatorSx['&::after'],
            display: { xs: 'none', md: 'block' },
          },
        }}
      >
        <Button
          size="small"
          color="inherit"
          sx={{ justifyContent: 'flex-start', px: 0.5, minWidth: 0, whiteSpace: 'nowrap' }}
          onClick={() => onToggleSort('name')}
          aria-label={t('dataroomSortByNameAria')}
          aria-pressed={sortState.field === 'name'}
        >
          {t('dataroomColumnName')} {sortIndicator('name')}
        </Button>
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'block' },
          minWidth: 0,
          pr: 1,
          ...headerSeparatorSx,
        }}
      >
        <Button
          size="small"
          color="inherit"
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            justifyContent: 'flex-start',
            px: 0.5,
            minWidth: 0,
            whiteSpace: 'nowrap',
          }}
          onClick={() => onToggleSort('updated')}
          aria-label={t('dataroomSortByUpdatedAria')}
          aria-pressed={sortState.field === 'updated'}
        >
          {t('dataroomColumnUpdated')} {sortIndicator('updated')}
        </Button>
      </Box>
      <Box sx={{ position: 'relative', minWidth: 0, pl: { xs: 0, md: 0.5 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end' }}>
          {t('dataroomColumnActions')}
        </Typography>
      </Box>
    </Box>
  )
}
