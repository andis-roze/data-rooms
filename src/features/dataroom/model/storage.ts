import { createSeedDataRoomState, DATAROOM_SCHEMA_VERSION } from './seed'
import type { DataRoomState } from './types'

const STORAGE_KEY = 'dataroom/state'

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  const localStorageRef = window.localStorage as Partial<Storage> | undefined

  if (!localStorageRef) {
    return null
  }

  if (
    typeof localStorageRef.getItem !== 'function' ||
    typeof localStorageRef.setItem !== 'function' ||
    typeof localStorageRef.removeItem !== 'function'
  ) {
    return null
  }

  return localStorageRef as Storage
}

function isDataRoomState(value: unknown): value is DataRoomState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<DataRoomState>

  return (
    typeof candidate.schemaVersion === 'number' &&
    Array.isArray(candidate.dataRoomOrder) &&
    typeof candidate.dataRoomsById === 'object' &&
    candidate.dataRoomsById !== null &&
    typeof candidate.foldersById === 'object' &&
    candidate.foldersById !== null &&
    typeof candidate.filesById === 'object' &&
    candidate.filesById !== null
  )
}

function migrateStateIfNeeded(state: DataRoomState): DataRoomState {
  if (state.schemaVersion === DATAROOM_SCHEMA_VERSION) {
    return state
  }

  return createSeedDataRoomState()
}

export function loadDataRoomState(): DataRoomState {
  const localStorageRef = getLocalStorage()

  if (!localStorageRef) {
    return createSeedDataRoomState()
  }

  const raw = localStorageRef.getItem(STORAGE_KEY)

  if (!raw) {
    return createSeedDataRoomState()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isDataRoomState(parsed)) {
      return createSeedDataRoomState()
    }

    return migrateStateIfNeeded(parsed)
  } catch {
    return createSeedDataRoomState()
  }
}

export function saveDataRoomState(state: DataRoomState): void {
  const localStorageRef = getLocalStorage()

  if (!localStorageRef) {
    return
  }

  localStorageRef.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearDataRoomState(): void {
  const localStorageRef = getLocalStorage()

  if (!localStorageRef) {
    return
  }

  localStorageRef.removeItem(STORAGE_KEY)
}

export function dataRoomStorageKey(): string {
  return STORAGE_KEY
}
