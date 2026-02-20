import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { truncateMiddle } from '../services/formatters'

interface DialogEntityNameProps {
  name: string
  maxLength?: number
}

export function DialogEntityName({ name, maxLength = 56 }: DialogEntityNameProps) {
  const displayName = truncateMiddle(name, maxLength)
  const isTruncated = displayName !== name

  return (
    <Tooltip title={name} disableHoverListener={!isTruncated}>
      <Typography
        component="div"
        sx={{
          mt: 1,
          px: 1,
          py: 0.75,
          borderRadius: 1,
          bgcolor: 'action.hover',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </Typography>
    </Tooltip>
  )
}
