import type { Dispatch } from 'react'
import { useContext } from 'react'
import { DataRoomDispatchContext, DataRoomStateContext } from './contexts'
import type { DataRoomAction, DataRoomStoreState } from './types'

export function useDataRoomState(): DataRoomStoreState {
  const context = useContext(DataRoomStateContext)

  if (!context) {
    throw new Error('useDataRoomState must be used within DataRoomProvider')
  }

  return context
}

export function useDataRoomDispatch(): Dispatch<DataRoomAction> {
  const context = useContext(DataRoomDispatchContext)

  if (!context) {
    throw new Error('useDataRoomDispatch must be used within DataRoomProvider')
  }

  return context
}
