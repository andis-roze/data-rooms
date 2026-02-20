import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { ChangeEvent, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { Folder, NodeId } from '../../dataroom/model'
import { DialogEntityName } from '../dialogs/DialogEntityName'
import { formatPathForDisplay, truncateMiddle } from '../services/formatters'
import { FolderContentTable } from '../FolderContentTable'
import type { FileItem, FolderContentItem, SortState } from '../types'

interface HomeContentSectionStateProps {
  activeDataRoomName: string
  activeFolderId: NodeId
  breadcrumbs: Folder[]
  visibleContentItems: FolderContentItem[]
  sortState: SortState
  locale: string
  resolveDisplayName: (value: string) => string
  checkedContentItemIds: NodeId[]
  selectedContentItemCount: number
  deleteSelectedContentItemCount: number
  deleteSelectedFileCount: number
  deleteSelectedFolderCount: number
  selectedContentItemNames: string[]
  indeterminateFolderIds: NodeId[]
  moveContentDialogOpen: boolean
  moveItemCount: number
  moveItemNames: string[]
  moveDestinationFolderId: NodeId | null
  moveDestinationFolderOptions: Array<{ id: NodeId; name: string; depth: number; path: string; parentPath: string | null }>
  moveValidationError: string | null
  dragMoveActive: boolean
  dragMoveTargetFolderId: NodeId | null
  deleteSelectedContentDialogOpen: boolean
  uploadInputRef: RefObject<HTMLInputElement | null>
}

interface HomeContentSectionHandlerProps {
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
  onOpenMoveSelectedContentDialog: () => void
  onCloseMoveContentDialog: () => void
  onMoveDestinationFolderChange: (folderId: NodeId) => void
  onMoveSelectedContent: () => void
  onStartDragMove: (itemId: NodeId) => void
  onEndDragMove: () => void
  onSetDragMoveTargetFolder: (folderId: NodeId | null) => void
  onCanDropOnFolder: (folderId: NodeId) => boolean
  onDropOnFolder: (folderId: NodeId) => void
  onSelectFolder: (folderId: NodeId) => void
  onOpenRenameFolder: (folder: Folder) => void
  onOpenDeleteFolder: (folder: Folder) => void
  onOpenMoveFolder: (folder: Folder) => void
  onOpenViewFile: (file: FileItem['file']) => void
  onOpenRenameFile: (file: FileItem['file']) => void
  onOpenDeleteFile: (file: FileItem['file']) => void
  onOpenMoveFile: (file: FileItem['file']) => void
}

interface HomeContentSectionProps {
  state: HomeContentSectionStateProps
  handlers: HomeContentSectionHandlerProps
}

export function HomeContentSection({
  state,
  handlers,
}: HomeContentSectionProps) {
  const {
  activeDataRoomName,
  activeFolderId,
  breadcrumbs,
  visibleContentItems,
  sortState,
  locale,
  resolveDisplayName,
  checkedContentItemIds,
  selectedContentItemCount,
  deleteSelectedContentItemCount,
  deleteSelectedFileCount,
  deleteSelectedFolderCount,
  selectedContentItemNames,
  indeterminateFolderIds,
  moveContentDialogOpen,
  moveItemCount,
  moveItemNames,
  moveDestinationFolderId,
  moveDestinationFolderOptions,
  moveValidationError,
  dragMoveActive,
  dragMoveTargetFolderId,
  deleteSelectedContentDialogOpen,
  uploadInputRef,
  } = state

  const {
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
  onOpenMoveSelectedContentDialog,
  onCloseMoveContentDialog,
  onMoveDestinationFolderChange,
  onMoveSelectedContent,
  onStartDragMove,
  onEndDragMove,
  onSetDragMoveTargetFolder,
  onCanDropOnFolder,
  onDropOnFolder,
  onSelectFolder,
  onOpenRenameFolder,
  onOpenDeleteFolder,
  onOpenMoveFolder,
  onOpenViewFile,
  onOpenRenameFile,
  onOpenDeleteFile,
  onOpenMoveFile,
  } = handlers

  const { t } = useTranslation()
  const activeDataRoomDisplayName = formatPathForDisplay(activeDataRoomName)
  const formatMoveOptionLabel = (name: string) => truncateMiddle(name, 56)

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
              <Button variant="contained" onClick={onOpenMoveSelectedContentDialog}>
                {t('dataroomActionMove')}
              </Button>
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
          selectedItemIds={checkedContentItemIds}
          indeterminateFolderIds={indeterminateFolderIds}
          dragMoveActive={dragMoveActive}
          dragMoveTargetFolderId={dragMoveTargetFolderId}
          onStartDragMove={onStartDragMove}
          onEndDragMove={onEndDragMove}
          onSetDragMoveTargetFolder={onSetDragMoveTargetFolder}
          onCanDropOnFolder={onCanDropOnFolder}
          onDropOnFolder={onDropOnFolder}
          onToggleItemSelection={onToggleContentItemSelection}
          onToggleAllItemSelection={onToggleAllContentItemSelection}
          onSelectFolder={onSelectFolder}
          onOpenRenameFolder={onOpenRenameFolder}
          onOpenDeleteFolder={onOpenDeleteFolder}
          onOpenMoveFolder={onOpenMoveFolder}
          onOpenViewFile={onOpenViewFile}
          onOpenRenameFile={onOpenRenameFile}
          onOpenDeleteFile={onOpenDeleteFile}
          onOpenMoveFile={onOpenMoveFile}
        />
      </Stack>

      <Dialog open={moveContentDialogOpen} onClose={onCloseMoveContentDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('dataroomDialogMoveTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomMoveSelectedQuestion', { count: moveItemCount })}</Typography>
          {moveItemNames.slice(0, 3).map((name, index) => (
            <DialogEntityName key={`${name}-${index}`} name={name} maxLength={36} />
          ))}
          {moveItemNames.length > 3 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {t('dataroomSelectionMoreItems', { count: moveItemNames.length - 3 })}
            </Typography>
          ) : null}
          <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{t('dataroomFieldDestinationFolder')}</Typography>
          <Paper variant="outlined" sx={{ maxHeight: 220, overflowY: 'auto' }}>
            <List dense disablePadding aria-label={t('dataroomFieldDestinationFolder')}>
              {moveDestinationFolderOptions.map((folderOption) => {
                const displayLabel = formatMoveOptionLabel(folderOption.name)
                const displayParentPath = folderOption.parentPath ? truncateMiddle(folderOption.parentPath, 72) : null
                const isTruncated =
                  displayLabel !== folderOption.name ||
                  (folderOption.parentPath ? displayParentPath !== folderOption.parentPath : false)
                return (
                  <ListItemButton
                    key={folderOption.id}
                    selected={moveDestinationFolderId === folderOption.id}
                    onClick={() => onMoveDestinationFolderChange(folderOption.id)}
                    aria-label={folderOption.path}
                    sx={{ pl: 1 + folderOption.depth * 2 }}
                  >
                    <Tooltip title={folderOption.path} disableHoverListener={!isTruncated}>
                      <ListItemText
                        primary={displayLabel}
                        secondary={displayParentPath}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          color: 'text.secondary',
                        }}
                      />
                    </Tooltip>
                  </ListItemButton>
                )
              })}
            </List>
          </Paper>
          {moveValidationError ? (
            <Typography color="error" variant="body2">
              {moveValidationError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseMoveContentDialog}>{t('dataroomActionCancel')}</Button>
          <Button variant="contained" onClick={onMoveSelectedContent} disabled={Boolean(moveValidationError)}>
            {t('dataroomActionMove')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteSelectedContentDialogOpen} onClose={onCloseDeleteSelectedContentDialog} fullWidth maxWidth="xs">
        <DialogTitle>{t('dataroomDialogDeleteSelectedTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dataroomDeleteSelectedQuestion', { count: deleteSelectedContentItemCount })}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t('dataroomDeleteSelectedImpact', { fileCount: deleteSelectedFileCount, folderCount: deleteSelectedFolderCount })}
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
