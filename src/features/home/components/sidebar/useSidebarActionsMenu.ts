import type { MouseEvent } from 'react'
import { useState } from 'react'

export interface SidebarActionsMenuState {
  menuAnchorEl: HTMLElement | null
  menuAnchorReference: 'anchorEl' | 'anchorPosition'
  menuAnchorPosition: { top: number; left: number } | undefined
  isActionsMenuOpen: boolean
}

export interface SidebarActionsMenuHandlers {
  openActionsMenu: (event: MouseEvent<HTMLElement>) => void
  closeActionsMenu: () => void
}

export function useSidebarActionsMenu(): SidebarActionsMenuState & SidebarActionsMenuHandlers {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuAnchorReference, setMenuAnchorReference] = useState<'anchorEl' | 'anchorPosition'>('anchorEl')
  const [menuAnchorPosition, setMenuAnchorPosition] = useState<{ top: number; left: number } | undefined>(undefined)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)

  const openActionsMenu = (event: MouseEvent<HTMLElement>) => {
    const anchorElement = event.currentTarget
    const rect = anchorElement.getBoundingClientRect()
    const hasLayoutBox = rect.width > 0 || rect.height > 0

    if (hasLayoutBox) {
      setMenuAnchorEl(anchorElement)
      setMenuAnchorReference('anchorEl')
      setMenuAnchorPosition(undefined)
    } else {
      setMenuAnchorEl(null)
      setMenuAnchorReference('anchorPosition')
      setMenuAnchorPosition({
        top: Math.max(event.clientY, 0),
        left: Math.max(event.clientX, 0),
      })
    }

    setIsActionsMenuOpen(true)
  }

  const closeActionsMenu = () => {
    setIsActionsMenuOpen(false)
  }

  return {
    menuAnchorEl,
    menuAnchorReference,
    menuAnchorPosition,
    isActionsMenuOpen,
    openActionsMenu,
    closeActionsMenu,
  }
}
