import { useEffect, useRef } from 'react'
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
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const focusInput = () => {
      inputRef.current?.focus()
    }

    // Focus once immediately and once on the next frame so this works
    // reliably across dialog transitions and portal timing.
    const timerId = window.setTimeout(() => {
      focusInput()
      window.requestAnimationFrame(focusInput)
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          inputRef={inputRef}
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
