import Stack from '@mui/material/Stack'
import type { ChangeEvent, RefObject } from 'react'
import type { Folder, NodeId } from '../../../dataroom/model'
import { ContentActionBar } from './ContentActionBar'
import { ContentBreadcrumbBar } from './ContentBreadcrumbBar'
import { ContentSelectionBanner } from './ContentSelectionBanner'

interface ContentSectionHeaderProps {
  activeDataRoomName: string
  activeFolderId: NodeId
  breadcrumbs: Folder[]
  resolveDisplayName: (value: string) => string
  selectedContentItemCount: number
  uploadInputRef: RefObject<HTMLInputElement | null>
  onSelectFolder: (folderId: NodeId) => void
  onCreateFolder: () => void
  onUploadPdf: () => void
  onUploadInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenMoveSelectedContentDialog: () => void
  onOpenDeleteSelectedContentDialog: () => void
  onClearContentItemSelection: () => void
}

export function ContentSectionHeader({
  activeDataRoomName,
  activeFolderId,
  breadcrumbs,
  resolveDisplayName,
  selectedContentItemCount,
  uploadInputRef,
  onSelectFolder,
  onCreateFolder,
  onUploadPdf,
  onUploadInputChange,
  onOpenMoveSelectedContentDialog,
  onOpenDeleteSelectedContentDialog,
  onClearContentItemSelection,
}: ContentSectionHeaderProps) {
  return (
    <Stack spacing={2.5}>
      <ContentBreadcrumbBar
        activeDataRoomName={activeDataRoomName}
        activeFolderId={activeFolderId}
        breadcrumbs={breadcrumbs}
        resolveDisplayName={resolveDisplayName}
        onSelectFolder={onSelectFolder}
      />

      <ContentActionBar onCreateFolder={onCreateFolder} onUploadPdf={onUploadPdf} />

      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf,application/zip,.zip,application/x-tar,.tar,application/gzip,.tgz,.tar.gz"
        onChange={onUploadInputChange}
        data-testid="upload-pdf-input"
        style={{ display: 'none' }}
      />

      <ContentSelectionBanner
        selectedContentItemCount={selectedContentItemCount}
        onOpenMoveSelectedContentDialog={onOpenMoveSelectedContentDialog}
        onOpenDeleteSelectedContentDialog={onOpenDeleteSelectedContentDialog}
        onClearContentItemSelection={onClearContentItemSelection}
      />
    </Stack>
  )
}
