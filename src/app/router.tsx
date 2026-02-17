import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { AboutPage } from '../features/about/AboutPage'
import { HomePage } from '../features/home/HomePage'

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
        element: <AboutPage />,
      },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
