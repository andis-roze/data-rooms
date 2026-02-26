import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NamePromptDialog } from '../../features/home/dialogs/NamePromptDialog'

describe('NamePromptDialog focus behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('runs deferred focus logic via timeout and animation frame when opened', () => {
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0)
        return 1
      })

    render(
      <NamePromptDialog
        open
        title="Create folder"
        label="Folder name"
        value=""
        errorText={null}
        cancelLabel="Cancel"
        submitLabel="Create"
        onClose={() => {}}
        onValueChange={() => {}}
        onSubmit={() => {}}
      />,
    )

    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(rafSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'Folder name' })).toHaveFocus()
  })
})
