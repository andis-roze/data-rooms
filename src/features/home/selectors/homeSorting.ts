import type { FolderContentItem, SortField, SortState } from '../model/homeViewTypes'

export function sortContentItems(items: FolderContentItem[], sortState: SortState): FolderContentItem[] {
  return [...items].sort((a, b) => {
    const compareName = () => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    const directionMultiplier = sortState.direction === 'asc' ? 1 : -1

    if (sortState.field === 'type') {
      if (a.kind !== b.kind) {
        return (a.kind === 'folder' ? -1 : 1) * directionMultiplier
      }

      return compareName() * directionMultiplier
    }

    if (sortState.field === 'name') {
      return compareName() * directionMultiplier
    }

    if (a.updatedAt === b.updatedAt) {
      return compareName() * directionMultiplier
    }

    return (a.updatedAt - b.updatedAt) * directionMultiplier
  })
}

export function getNextSortState(previous: SortState, field: SortField): SortState {
  return previous.field === field
    ? { field, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
    : { field, direction: 'asc' }
}
