import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../dataroom/model'
import { formatPathForDisplay } from '../services/formatters'
import { FolderContentTable } from '../FolderContentTable'
import type { FileItem, FolderContentItem, SortState } from '../types'

interface HomeContentSectionProps {
  activeDataRoomName: string
  activeFolderId: NodeId
  breadcrumbs: Folder[]
  visibleContentItems: FolderContentItem[]
  sortState: SortState
  locale: string
  resolveDisplayName: (value: string) => string
  uploadInputRef: RefObject<HTMLInputElement | null>
  onCreateFolder: () => void
  onUploadPdf: () => void
  onUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggleSort: (field: 'name' | 'type' | 'updated') => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileItem['file']) => void
  onOpenRenameFile: (file: FileItem['file']) => void
  onOpenDeleteFile: (file: FileItem['file']) => void
}

export function HomeContentSection({
  activeDataRoomName,
  activeFolderId,
  breadcrumbs,
  visibleContentItems,
  sortState,
  locale,
  resolveDisplayName,
  uploadInputRef,
  onCreateFolder,
  onUploadPdf,
  onUploadInputChange,
  onToggleSort,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
}: HomeContentSectionProps) {
  const { t } = useTranslation()
  const activeDataRoomDisplayName = formatPathForDisplay(activeDataRoomName)

  return (
    <Box component="section" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" onClick={onCreateFolder}>
            {t('dataroomActionCreateFolder')}
          </Button>
          <Button variant="text" onClick={onUploadPdf}>
            {t('dataroomActionUploadPdf')}
          </Button>
        </Stack>

        <input
          ref={uploadInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onUploadInputChange}
          data-testid="upload-pdf-input"
          style={{ display: 'none' }}
        />

        <FolderContentTable
          items={visibleContentItems}
          sortState={sortState}
          onToggleSort={onToggleSort}
          locale={locale}
          resolveDisplayName={resolveDisplayName}
          onSelectFolder={onSelectFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          onOpenViewFile={onOpenViewFile}
          onOpenRenameFile={onOpenRenameFile}
          onOpenDeleteFile={onOpenDeleteFile}
        />
      </Stack>
    </Box>
  )
}
