import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useSidebarActionsMenu } from '../../features/home/components/sidebar/useSidebarActionsMenu'

function createMenuEvent(
  rect: { width: number; height: number },
  point: { x: number; y: number },
): ReactMouseEvent<HTMLElement> {
  const element = document.createElement('button')
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: rect.width,
      bottom: rect.height,
      width: rect.width,
      height: rect.height,
      toJSON: () => ({}),
    }) as DOMRect

  return {
    currentTarget: element,
    clientX: point.x,
    clientY: point.y,
  } as unknown as ReactMouseEvent<HTMLElement>
}

describe('useSidebarActionsMenu', () => {
  it('anchors to element when trigger has layout box', () => {
    const { result } = renderHook(() => useSidebarActionsMenu())

    act(() => {
      result.current.openActionsMenu(createMenuEvent({ width: 24, height: 24 }, { x: 10, y: 20 }))
    })

    expect(result.current.isActionsMenuOpen).toBe(true)
    expect(result.current.menuAnchorReference).toBe('anchorEl')
    expect(result.current.menuAnchorEl).not.toBeNull()
    expect(result.current.menuAnchorPosition).toBeUndefined()
  })

  it('falls back to anchorPosition when trigger has no layout box', () => {
    const { result } = renderHook(() => useSidebarActionsMenu())

    act(() => {
      result.current.openActionsMenu(createMenuEvent({ width: 0, height: 0 }, { x: 42, y: 18 }))
    })

    expect(result.current.isActionsMenuOpen).toBe(true)
    expect(result.current.menuAnchorReference).toBe('anchorPosition')
    expect(result.current.menuAnchorEl).toBeNull()
    expect(result.current.menuAnchorPosition).toEqual({ top: 18, left: 42 })
  })
})
