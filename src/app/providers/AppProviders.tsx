import type { PropsWithChildren } from 'react'
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material'
import { DataRoomProvider } from '../../features/dataroom/state'
import { appTheme } from '../theme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            background:
              'radial-gradient(circle at top right, rgba(15,118,110,0.18), transparent 42%), radial-gradient(circle at bottom left, rgba(251,133,0,0.18), transparent 38%), #f2f5f9',
            minHeight: '100vh',
          },
        }}
      />
      <DataRoomProvider>{children}</DataRoomProvider>
    </ThemeProvider>
  )
}
