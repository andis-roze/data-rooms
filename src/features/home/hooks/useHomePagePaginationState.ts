import { useEffect } from 'react'
import type { NodeId } from '../../dataroom/model'
import type { FolderContentItem } from '../types'

interface UseHomePagePaginationStateParams {
  visibleContentItems: FolderContentItem[]
  listViewPage: number
  listViewItemsPerPage: number
  activeFolderId: NodeId | null
  setListViewPage: (page: number) => void
}

export function useHomePagePaginationState({
  visibleContentItems,
  listViewPage,
  listViewItemsPerPage,
  activeFolderId,
  setListViewPage,
}: UseHomePagePaginationStateParams) {
  const listViewPageCount = Math.max(1, Math.ceil(visibleContentItems.length / listViewItemsPerPage))
  const resolvedListViewPage = Math.min(listViewPage, listViewPageCount - 1)
  const pageStart = resolvedListViewPage * listViewItemsPerPage
  const pageEnd = pageStart + listViewItemsPerPage
  const pagedContentItems = visibleContentItems.slice(pageStart, pageEnd)

  useEffect(() => {
    if (listViewPage !== resolvedListViewPage) {
      setListViewPage(resolvedListViewPage)
    }
  }, [listViewPage, resolvedListViewPage, setListViewPage])

  useEffect(() => {
    setListViewPage(0)
  }, [activeFolderId, listViewItemsPerPage, setListViewPage])

  return {
    listViewPageCount,
    resolvedListViewPage,
    pagedContentItems,
  }
}
