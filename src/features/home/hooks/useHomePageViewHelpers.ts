import type { NodeId } from '../../dataroom/model'
import { normalizeNodeName, type DataRoomState } from '../../dataroom/model'

interface UseHomePageViewHelpersParams {
  entities: DataRoomState
  translate: (key: string, options?: Record<string, unknown>) => string
}

export function useHomePageViewHelpers({ entities, translate }: UseHomePageViewHelpersParams) {
  const resolveDisplayName = (value: string) => (value.startsWith('i18n:') ? translate(value.slice(5)) : value)

  const hasDuplicateDataRoomDisplayName = (candidateName: string, excludeDataRoomId?: NodeId) => {
    const normalizedCandidate = normalizeNodeName(candidateName)

    return entities.dataRoomOrder.some((dataRoomId) => {
      if (excludeDataRoomId && dataRoomId === excludeDataRoomId) {
        return false
      }

      const dataRoom = entities.dataRoomsById[dataRoomId]
      if (!dataRoom) {
        return false
      }

      return normalizeNodeName(resolveDisplayName(dataRoom.name)) === normalizedCandidate
    })
  }

  return {
    resolveDisplayName,
    hasDuplicateDataRoomDisplayName,
  }
}
