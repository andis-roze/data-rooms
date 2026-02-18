import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

interface NamePromptDialogProps {
  open: boolean
  title: string
  label: string
  value: string
  errorText: string | null
  cancelLabel: string
  submitLabel: string
  onClose: () => void
  onValueChange: (value: string) => void
  onSubmit: () => void
}

export function NamePromptDialog({
  open,
  title,
  label,
  value,
  errorText,
  cancelLabel,
  submitLabel,
  onClose,
  onValueChange,
  onSubmit,
}: NamePromptDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          label={label}
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value)
          }}
          error={Boolean(errorText)}
          helperText={errorText ?? ' '}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button onClick={onSubmit} variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
