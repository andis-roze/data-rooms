import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from './providers/AppProviders'
import { appRoutes } from './router'
import i18n from '../i18n/config'

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('App routing and localization', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders home route with localized navigation', () => {
    renderRoute('/')

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Build products that speak every language' })).toBeInTheDocument()
  })

  it('renders about route', () => {
    renderRoute('/about')

    expect(screen.getByRole('heading', { name: 'About this starter' })).toBeInTheDocument()
  })

  it('switches language to German from header controls', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('link', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Baue Produkte, die jede Sprache sprechen' })).toBeInTheDocument()
  })
})
