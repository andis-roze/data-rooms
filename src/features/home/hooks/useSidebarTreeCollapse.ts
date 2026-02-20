import { useMemo, useState } from 'react'
import type { DataRoomState, NodeId } from '../../dataroom/model'

interface UseSidebarTreeCollapseParams {
  entities: DataRoomState
  selectedDataRoomId: NodeId | null
  selectedFolderId: NodeId | null
}

export function useSidebarTreeCollapse({
  entities,
  selectedDataRoomId,
  selectedFolderId,
}: UseSidebarTreeCollapseParams) {
  const [collapseOverrides, setCollapseOverrides] = useState<Map<NodeId, boolean>>(new Map())

  const autoCollapsedNodeIds = useMemo(() => {
    if (!selectedDataRoomId || !selectedFolderId) {
      return new Set<NodeId>()
    }

    const selectedFolder = entities.foldersById[selectedFolderId]
    if (!selectedFolder) {
      return new Set<NodeId>()
    }

    const requiredOpenNodeIds = new Set<NodeId>()
    let currentFolder = selectedFolder

    while (currentFolder.parentFolderId) {
      requiredOpenNodeIds.add(currentFolder.parentFolderId)
      const parentFolder = entities.foldersById[currentFolder.parentFolderId]
      if (!parentFolder) {
        break
      }
      currentFolder = parentFolder
    }

    const nextCollapsedNodeIds = new Set<NodeId>()

    for (const folder of Object.values(entities.foldersById)) {
      if (folder.childFolderIds.length > 0 && !requiredOpenNodeIds.has(folder.id)) {
        nextCollapsedNodeIds.add(folder.id)
      }
    }

    return nextCollapsedNodeIds
  }, [entities.foldersById, selectedDataRoomId, selectedFolderId])

  const collapsedNodeIds = useMemo(() => {
    const next = new Set(autoCollapsedNodeIds)
    for (const [nodeId, isCollapsed] of collapseOverrides) {
      if (isCollapsed) {
        next.add(nodeId)
      } else {
        next.delete(nodeId)
      }
    }
    return next
  }, [autoCollapsedNodeIds, collapseOverrides])

  const toggleNode = (nodeId: NodeId) => {
    setCollapseOverrides((previous) => {
      const next = new Map(previous)
      const isCollapsed = previous.has(nodeId) ? previous.get(nodeId) === true : autoCollapsedNodeIds.has(nodeId)
      next.set(nodeId, !isCollapsed)
      return next
    })
  }

  return {
    collapsedNodeIds,
    toggleNode,
  }
}
