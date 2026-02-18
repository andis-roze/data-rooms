import { useTranslation } from 'react-i18next'
import { NamePromptDialog } from './NamePromptDialog'

interface CreateDataRoomDialogProps {
  open: boolean
  dataRoomNameDraft: string
  dataRoomNameError: string | null
  onClose: () => void
  onDataRoomNameDraftChange: (value: string) => void
  onSubmit: () => void
}

export function CreateDataRoomDialog({
  open,
  dataRoomNameDraft,
  dataRoomNameError,
  onClose,
  onDataRoomNameDraftChange,
  onSubmit,
}: CreateDataRoomDialogProps) {
  const { t } = useTranslation()

  return (
    <NamePromptDialog
      open={open}
      title={t('dataroomDialogCreateDataRoomTitle')}
      label={t('dataroomFieldDataRoomName')}
      value={dataRoomNameDraft}
      errorText={dataRoomNameError}
      cancelLabel={t('dataroomActionCancel')}
      submitLabel={t('dataroomActionCreate')}
      onClose={onClose}
      onValueChange={onDataRoomNameDraftChange}
      onSubmit={onSubmit}
    />
  )
}
