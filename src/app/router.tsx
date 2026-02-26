import { Suspense, lazy } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from '../features/home'

const AboutPage = lazy(async () => {
  const module = await import('../features/about/AboutPage')
  return { default: module.AboutPage }
})

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={null}>
            <AboutPage />
          </Suspense>
        ),
      },
    ],
  },
]

function resolveRouterBasename() {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalized = baseUrl.endsWith('/') && baseUrl.length > 1
    ? baseUrl.slice(0, -1)
    : baseUrl
  return normalized === '/' ? undefined : normalized
}

export const appRouter = createBrowserRouter(appRoutes, {
  basename: resolveRouterBasename(),
})
