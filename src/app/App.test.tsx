import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from './providers/AppProviders'
import { appRoutes } from './router'
import i18n from '../i18n/config'
import { clearDataRoomState } from '../features/dataroom/model'

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
    clearDataRoomState()
    await i18n.changeLanguage('en')
  })

  it('renders home route with data room shell and localized navigation', () => {
    renderRoute('/')

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Room' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Folder tree' })).toBeInTheDocument()
    expect(screen.getByLabelText('Folder breadcrumbs')).toBeInTheDocument()
    expect(screen.getByText('This folder is empty')).toBeInTheDocument()
  })

  it('creates, renames, and deletes a folder from the toolbar flow', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Create folder' }))
    await user.type(screen.getByRole('textbox', { name: 'Folder name' }), 'Finance')
    await user.click(screen.getByRole('button', { name: 'Create' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create folder' }))

    expect(screen.getAllByText('Finance').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Rename folder' }))
    const renameInput = screen.getByRole('textbox', { name: 'Folder name' })
    await user.clear(renameInput)
    await user.type(renameInput, 'Legal')
    await user.click(screen.getByRole('button', { name: 'Rename' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Rename folder' }))

    expect(screen.getAllByText('Legal').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Delete folder' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete folder' }))

    expect(screen.queryByText('Legal')).not.toBeInTheDocument()
    expect(screen.getAllByText('Data Room').length).toBeGreaterThan(0)
  })

  it('uploads, renames, and deletes a pdf file with duplicate validation', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    const uploadInput = screen.getByTestId('upload-pdf-input') as HTMLInputElement
    const file = new File(['%PDF-1.4 test'], 'contract.pdf', { type: 'application/pdf' })

    await user.upload(uploadInput, file)
    expect(screen.getByText('contract.pdf')).toBeInTheDocument()

    await user.upload(uploadInput, file)
    expect(screen.getByText('File with this name already exists in this location.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Rename file contract.pdf' }))
    const renameFileInput = screen.getByRole('textbox', { name: 'File name' })
    await user.clear(renameFileInput)
    await user.type(renameFileInput, 'nda.pdf')
    await user.click(screen.getByRole('button', { name: 'Rename' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Rename file' }))

    expect(screen.getByText('nda.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete file nda.pdf' }))
    const deleteFileDialog = screen.getByRole('dialog', { name: 'Delete file' })
    await user.click(within(deleteFileDialog).getByRole('button', { name: 'Delete' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete file' }))

    expect(screen.queryByText('nda.pdf')).not.toBeInTheDocument()
  })

  it('switches language to German from header controls', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('link', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Room' })).toBeInTheDocument()
  })
})
