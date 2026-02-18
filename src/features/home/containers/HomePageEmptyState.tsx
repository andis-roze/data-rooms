import { EmptyDataRoomState } from '../components/EmptyDataRoomState'
import { CreateDataRoomDialog } from '../dialogs/CreateDataRoomDialog'

interface HomePageEmptyStateProps {
  title: string
  body: string
  actionLabel: string
  isCreateDataRoomDialogOpen: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  onOpenCreateDataRoomDialog: () => void
  onCloseCreateDataRoomDialog: () => void
  onDataRoomNameDraftChange: (value: string) => void
  onCreateDataRoom: () => void
}

export function HomePageEmptyState({
  title,
  body,
  actionLabel,
  isCreateDataRoomDialogOpen,
  dataRoomNameDraft,
  dataRoomNameError,
  onOpenCreateDataRoomDialog,
  onCloseCreateDataRoomDialog,
  onDataRoomNameDraftChange,
  onCreateDataRoom,
}: HomePageEmptyStateProps) {
  return (
    <EmptyDataRoomState
      title={title}
      body={body}
      actionLabel={actionLabel}
      onCreateDataRoom={onOpenCreateDataRoomDialog}
    >
      <CreateDataRoomDialog
        open={isCreateDataRoomDialogOpen}
        dataRoomNameDraft={dataRoomNameDraft}
        dataRoomNameError={dataRoomNameError}
        onClose={onCloseCreateDataRoomDialog}
        onDataRoomNameDraftChange={onDataRoomNameDraftChange}
        onSubmit={onCreateDataRoom}
      />
    </EmptyDataRoomState>
  )
}
