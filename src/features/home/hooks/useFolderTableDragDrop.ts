import type { DragEvent } from 'react'
import type { NodeId } from '../../dataroom/model'

interface UseFolderTableDragDropParams {
  onCanDropOnFolder: (folderId: NodeId) => boolean
}

export function useFolderTableDragDrop({ onCanDropOnFolder }: UseFolderTableDragDropParams) {
  const handleFolderDragOver = (event: DragEvent<HTMLLIElement>, folderId: NodeId) => {
    if (onCanDropOnFolder(folderId)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }

  return {
    handleFolderDragOver,
  }
}
