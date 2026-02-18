import { useDataRoomActions } from './useDataRoomActions'
import { useFileActions } from './useFileActions'
import { useFolderActions } from './useFolderActions'
import { useSortActions } from './useSortActions'

interface UseHomePageActionsParams {
  dataRoom: Parameters<typeof useDataRoomActions>[0]
  folder: Parameters<typeof useFolderActions>[0]
  file: Parameters<typeof useFileActions>[0]
  sort: Parameters<typeof useSortActions>[0]
}

export function useHomePageActions(params: UseHomePageActionsParams) {
  const dataRoomActions = useDataRoomActions(params.dataRoom)
  const folderActions = useFolderActions(params.folder)
  const fileActions = useFileActions(params.file)
  const sortActions = useSortActions(params.sort)

  return {
    ...dataRoomActions,
    ...folderActions,
    ...fileActions,
    ...sortActions,
  }
}
