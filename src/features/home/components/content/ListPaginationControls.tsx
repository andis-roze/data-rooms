import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'

interface ListPaginationState {
  page: number
  pageCount: number
  itemsPerPage: number
  itemsPerPageOptions: number[]
}

interface ListPaginationHandlers {
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

interface ListPaginationControlsProps {
  state: ListPaginationState
  handlers: ListPaginationHandlers
}

export function ListPaginationControls({ state, handlers }: ListPaginationControlsProps) {
  const { page, pageCount, itemsPerPage, itemsPerPageOptions } = state
  const { onPageChange, onItemsPerPageChange } = handlers

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    onItemsPerPageChange(Number(event.target.value))
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Items per page
        </Typography>
        <Select
          size="small"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          inputProps={{ 'aria-label': 'Items per page' }}
        >
          {itemsPerPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Page {page + 1} / {pageCount}
        </Typography>
        <Button
          size="small"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page <= 0}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <Button
          size="small"
          onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
          disabled={page >= pageCount - 1}
          aria-label="Next page"
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
