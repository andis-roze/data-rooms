import { useHomePageActions as useComposedHomePageActions } from './hooks/useHomePageActions'

type UseHomePageActionsParams = Parameters<typeof useComposedHomePageActions>[0]

// Backward-compatible wrapper while action logic stays in focused hooks.
export function useHomePageHandlers(params: UseHomePageActionsParams) {
  return useComposedHomePageActions(params)
}
