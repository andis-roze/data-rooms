import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import type { ReactNode } from 'react'
import { HomeContentSection, type HomeContentSectionHandlers, type HomeContentSectionState } from '../HomeContentSection'
import { HomeSidebar, type HomeSidebarHandlers, type HomeSidebarState } from '../HomeSidebar'

interface HomePageWorkspaceProps {
  sidebarState: HomeSidebarState
  sidebarHandlers: HomeSidebarHandlers
  contentState: HomeContentSectionState
  contentHandlers: HomeContentSectionHandlers
  children: ReactNode
}

export function HomePageWorkspace({
  sidebarState,
  sidebarHandlers,
  contentState,
  contentHandlers,
  children,
}: HomePageWorkspaceProps) {
  return (
    <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: { md: '70vh' },
        }}
      >
        <HomeSidebar state={sidebarState} handlers={sidebarHandlers} />

        <HomeContentSection state={contentState} handlers={contentHandlers} />
      </Paper>

      {children}
    </Container>
  )
}
