import type { PropsWithChildren } from 'react'
import { useEffect, useReducer } from 'react'
import { loadDataRoomState, saveDataRoomState } from '../model'
import { createInitialDataRoomStoreState, dataRoomReducer } from './reducer'
import { DataRoomDispatchContext, DataRoomStateContext } from './contexts'
import type { DataRoomStoreState } from './types'

function initDataRoomStoreState(): DataRoomStoreState {
  const entities = loadDataRoomState()
  return createInitialDataRoomStoreState(entities)
}

export function DataRoomProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(dataRoomReducer, undefined, initDataRoomStoreState)

  useEffect(() => {
    saveDataRoomState(state.entities)
  }, [state.entities])

  return (
    <DataRoomStateContext.Provider value={state}>
      <DataRoomDispatchContext.Provider value={dispatch}>{children}</DataRoomDispatchContext.Provider>
    </DataRoomStateContext.Provider>
  )
}
