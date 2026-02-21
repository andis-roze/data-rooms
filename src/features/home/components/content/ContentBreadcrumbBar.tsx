import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../../dataroom/model'
import { formatPathForDisplay } from '../../services/formatters'

interface ContentBreadcrumbBarProps {
  activeDataRoomName: string
  activeFolderId: NodeId
  breadcrumbs: Folder[]
  resolveDisplayName: (value: string) => string
  onSelectFolder: (folderId: NodeId) => void
}

export function ContentBreadcrumbBar({
  activeDataRoomName,
  activeFolderId,
  breadcrumbs,
  resolveDisplayName,
  onSelectFolder,
}: ContentBreadcrumbBarProps) {
  const { t } = useTranslation()
  const activeDataRoomDisplayName = formatPathForDisplay(activeDataRoomName)

  return (
    <Stack spacing={0.75}>
      <Typography
        variant="h1"
        title={activeDataRoomName}
        sx={{
          fontSize: { xs: '1.5rem', md: '2rem' },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {activeDataRoomDisplayName}
      </Typography>
      <Breadcrumbs aria-label={t('dataroomBreadcrumbsLabel')}>
        {breadcrumbs.map((folder) => (
          <Button
            key={folder.id}
            size="small"
            color={folder.id === activeFolderId ? 'primary' : 'inherit'}
            onClick={() => onSelectFolder(folder.id)}
            title={resolveDisplayName(folder.name)}
            aria-label={resolveDisplayName(folder.name)}
          >
            {formatPathForDisplay(resolveDisplayName(folder.name))}
          </Button>
        ))}
      </Breadcrumbs>
    </Stack>
  )
}
