import type { Dispatch } from 'react'
import { createContext } from 'react'
import type { DataRoomAction, DataRoomStoreState } from './types'

export const DataRoomStateContext = createContext<DataRoomStoreState | null>(null)
export const DataRoomDispatchContext = createContext<Dispatch<DataRoomAction> | null>(null)
