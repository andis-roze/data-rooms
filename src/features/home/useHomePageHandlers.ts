import { useHomePageActions as useComposedHomePageActions } from './hooks/useHomePageActions'

type UseHomePageActionsParams = Parameters<typeof useComposedHomePageActions>[0]

// Compatibility layer to keep older imports stable while logic lives in focused hooks.
export function useHomePageHandlers(params: UseHomePageActionsParams) {
  return useComposedHomePageActions(params)
}
