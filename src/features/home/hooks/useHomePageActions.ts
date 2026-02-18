import type { HomeActionCommonParams } from './actionParams'
import { useDataRoomActions } from './useDataRoomActions'
import { useFileActions } from './useFileActions'
import { useFolderActions } from './useFolderActions'
import { useSortActions } from './useSortActions'

export function useHomePageActions(params: HomeActionCommonParams) {
  const dataRoomActions = useDataRoomActions(params)
  const folderActions = useFolderActions(params)
  const fileActions = useFileActions(params)
  const sortActions = useSortActions(params)

  return {
    ...dataRoomActions,
    ...folderActions,
    ...fileActions,
    ...sortActions,
  }
}
