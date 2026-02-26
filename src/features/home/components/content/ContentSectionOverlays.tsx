import type { NodeId } from '../../../dataroom/model'
import { DeleteSelectedContentDialog } from './DeleteSelectedContentDialog'
import { MoveContentDialog } from './MoveContentDialog'

interface MoveDestinationOption {
  id: NodeId
  name: string
  depth: number
  path: string
  parentPath: string | null
}

interface ContentSectionOverlaysProps {
  moveContentDialogOpen: boolean
  moveItemCount: number
  moveItemNames: string[]
  moveDestinationFolderId: NodeId | null
  moveDestinationFolderOptions: MoveDestinationOption[]
  moveValidationError: string | null
  deleteSelectedContentDialogOpen: boolean
  deleteSelectedContentItemCount: number
  deleteSelectedFileCount: number
  deleteSelectedFolderCount: number
  selectedContentItemNames: string[]
  onCloseMoveContentDialog: () => void
  onMoveDestinationFolderChange: (folderId: NodeId) => void
  onMoveSelectedContent: () => void
  onCloseDeleteSelectedContentDialog: () => void
  onDeleteSelectedContent: () => Promise<void>
}

export function ContentSectionOverlays({
  moveContentDialogOpen,
  moveItemCount,
  moveItemNames,
  moveDestinationFolderId,
  moveDestinationFolderOptions,
  moveValidationError,
  deleteSelectedContentDialogOpen,
  deleteSelectedContentItemCount,
  deleteSelectedFileCount,
  deleteSelectedFolderCount,
  selectedContentItemNames,
  onCloseMoveContentDialog,
  onMoveDestinationFolderChange,
  onMoveSelectedContent,
  onCloseDeleteSelectedContentDialog,
  onDeleteSelectedContent,
}: ContentSectionOverlaysProps) {
  return (
    <>
      <MoveContentDialog
        open={moveContentDialogOpen}
        moveItemCount={moveItemCount}
        moveItemNames={moveItemNames}
        moveDestinationFolderId={moveDestinationFolderId}
        moveDestinationFolderOptions={moveDestinationFolderOptions}
        moveValidationError={moveValidationError}
        onClose={onCloseMoveContentDialog}
        onMoveDestinationFolderChange={onMoveDestinationFolderChange}
        onConfirmMove={onMoveSelectedContent}
      />

      <DeleteSelectedContentDialog
        open={deleteSelectedContentDialogOpen}
        deleteSelectedContentItemCount={deleteSelectedContentItemCount}
        deleteSelectedFileCount={deleteSelectedFileCount}
        deleteSelectedFolderCount={deleteSelectedFolderCount}
        selectedContentItemNames={selectedContentItemNames}
        onClose={onCloseDeleteSelectedContentDialog}
        onConfirmDelete={onDeleteSelectedContent}
      />
    </>
  )
}
