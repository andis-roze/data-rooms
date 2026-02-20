import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../dataroom/model'
import { DialogEntityName } from '../dialogs/DialogEntityName'
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
  selectedContentItemIds: NodeId[]
  selectedContentItemCount: number
  selectedFileCount: number
  selectedFolderCount: number
  selectedContentItemNames: string[]
  deleteSelectedContentDialogOpen: boolean
  uploadInputRef: RefObject<HTMLInputElement | null>
  onCreateFolder: () => void
  onUploadPdf: () => void
  onUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggleSort: (field: 'name' | 'type' | 'updated') => void
  onToggleContentItemSelection: (itemId: NodeId) => void
  onToggleAllContentItemSelection: () => void
  onClearContentItemSelection: () => void
  onOpenDeleteSelectedContentDialog: () => void
  onCloseDeleteSelectedContentDialog: () => void
  onDeleteSelectedContent: () => Promise<void>
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
  selectedContentItemIds,
  selectedContentItemCount,
  selectedFileCount,
  selectedFolderCount,
  selectedContentItemNames,
  deleteSelectedContentDialogOpen,
  uploadInputRef,
  onCreateFolder,
  onUploadPdf,
  onUploadInputChange,
  onToggleSort,
  onToggleContentItemSelection,
  onToggleAllContentItemSelection,
  onClearContentItemSelection,
  onOpenDeleteSelectedContentDialog,
  onCloseDeleteSelectedContentDialog,
  onDeleteSelectedContent,
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

        {selectedContentItemCount > 0 ? (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 1.5,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              {t('dataroomSelectionCount', { count: selectedContentItemCount })}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button color="error" variant="contained" onClick={onOpenDeleteSelectedContentDialog}>
                {t('dataroomActionDeleteSelected')}
              </Button>
              <Button variant="text" onClick={onClearContentItemSelection}>
                {t('dataroomActionClearSelection')}
              </Button>
            </Stack>
          </Box>
        ) : null}

        <FolderContentTable
          items={visibleContentItems}
          sortState={sortState}
          onToggleSort={onToggleSort}
          locale={locale}
          resolveDisplayName={resolveDisplayName}
          selectedItemIds={selectedContentItemIds}
          onToggleItemSelection={onToggleContentItemSelection}
          onToggleAllItemSelection={onToggleAllContentItemSelection}
          onSelectFolder={onSelectFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          onOpenViewFile={onOpenViewFile}
          onOpenRenameFile={onOpenRenameFile}
          onOpenDeleteFile={onOpenDeleteFile}
        />
      </Stack>

      <Dialog open={deleteSelectedContentDialogOpen} onClose={onCloseDeleteSelectedContentDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteSelectedTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteSelectedQuestion', { count: selectedContentItemCount })}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteSelectedImpact', { fileCount: selectedFileCount, folderCount: selectedFolderCount })}
          </Typography>
          {selectedContentItemNames.slice(0, 3).map((name, index) => (
            <DialogEntityName key={`${name}-${index}`} name={name} maxLength={44} />
          ))}
          {selectedContentItemNames.length > 3 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('dataroomSelectionMoreItems', { count: selectedContentItemNames.length - 3 })}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDeleteSelectedContentDialog}>{t('dataroomActionCancel')}</Button>
          <Button color="error" variant="contained" onClick={() => void onDeleteSelectedContent()}>
            {t('dataroomActionDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
