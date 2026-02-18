import type { HomeActionCommonParams } from './hooks/actionParams'
import { useHomePageActions } from './hooks/useHomePageActions'

// Backward-compatible wrapper while moving action logic into focused hooks.
export function useHomePageHandlers(params: HomeActionCommonParams) {
  return useHomePageActions(params)
}
