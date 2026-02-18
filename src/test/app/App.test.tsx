import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '../../app/providers/AppProviders'
import { appRoutes } from '../../app/router'
import { clearDataRoomState } from '../../features/dataroom/model'
import i18n from '../../i18n/config'

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

async function createFolder(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: 'Create folder' }))
  await user.type(screen.getByRole('textbox', { name: 'Folder name' }), name)
  await user.click(screen.getByRole('button', { name: 'Create' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create folder' }))
}

async function renameFolder(user: ReturnType<typeof userEvent.setup>, currentName: string, nextName: string) {
  await user.click(screen.getByRole('button', { name: 'Data Room' }))
  await user.click(screen.getByRole('button', { name: `Rename folder ${currentName}` }))
  const renameInput = screen.getByRole('textbox', { name: 'Folder name' })
  await user.clear(renameInput)
  await user.type(renameInput, nextName)
  await user.click(screen.getByRole('button', { name: 'Rename' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Rename folder' }))
}

async function deleteFolder(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: `Delete folder ${name}` }))
  await user.click(screen.getByRole('button', { name: 'Delete' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete folder' }))
}

async function createDataRoom(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: 'Create data room' }))
  await user.type(screen.getByRole('textbox', { name: 'Data Room name' }), name)
  await user.click(screen.getByRole('button', { name: 'Create' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create data room' }))
}

async function renameDataRoom(user: ReturnType<typeof userEvent.setup>, nextName: string) {
  await user.click(screen.getByRole('button', { name: 'Rename data room' }))
  const renameDataRoomInput = screen.getByRole('textbox', { name: 'Data Room name' })
  await user.clear(renameDataRoomInput)
  await user.type(renameDataRoomInput, nextName)
  await user.click(screen.getByRole('button', { name: 'Rename' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Rename data room' }))
}

async function deleteCurrentDataRoom(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Delete data room' }))
  const deleteDataRoomDialog = screen.getByRole('dialog', { name: 'Delete data room' })
  await user.click(within(deleteDataRoomDialog).getByRole('button', { name: 'Delete' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Delete data room' }))
}

async function uploadPdf(user: ReturnType<typeof userEvent.setup>, name: string): Promise<void> {
  const uploadInput = screen.getByTestId('upload-pdf-input') as HTMLInputElement
  const file = new File(['%PDF-1.4 test'], name, { type: 'application/pdf' })
  await user.upload(uploadInput, file)
}

async function uploadNonPdf(user: ReturnType<typeof userEvent.setup>, name: string): Promise<void> {
  const uploadInput = screen.getByTestId('upload-pdf-input') as HTMLInputElement
  const file = new File(['plain text'], name, { type: 'text/plain' })
  await user.upload(uploadInput, file)
}

describe('App routing and localization', () => {
  beforeEach(async () => {
    clearDataRoomState()
    const storage = window.localStorage as Partial<Storage>
    if (typeof storage.removeItem === 'function') {
      storage.removeItem('dataroom/view-preferences')
    }
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

  it('creates, renames, and deletes a folder from row actions', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    expect(screen.getAllByText('Finance').length).toBeGreaterThan(0)

    await renameFolder(user, 'Finance', 'Legal')
    expect(screen.getAllByText('Legal').length).toBeGreaterThan(0)

    await deleteFolder(user, 'Legal')

    expect(screen.queryByText('Legal')).not.toBeInTheDocument()
    expect(screen.getAllByText('Data Room').length).toBeGreaterThan(0)
  }, 15000)

  it('creates, renames, and deletes a data room from sidebar controls', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createDataRoom(user, 'Project Zephyr')
    expect(screen.getByRole('heading', { name: 'Project Zephyr' })).toBeInTheDocument()

    await renameDataRoom(user, 'Project Apollo')
    expect(screen.getByRole('heading', { name: 'Project Apollo' })).toBeInTheDocument()

    await deleteCurrentDataRoom(user)
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Room' })).toBeInTheDocument()
  }, 15000)

  it('blocks creating a data room with duplicate name', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Create data room' }))
    await user.type(screen.getByRole('textbox', { name: 'Data Room name' }), 'Acme Due Diligence Room')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('A Data Room with this name already exists.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Create data room' })).toBeInTheDocument()
  })

  it('uploads, renames, and deletes a pdf file with duplicate validation', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await uploadPdf(user, 'contract.pdf')
    expect(screen.getByText('contract.pdf')).toBeInTheDocument()

    await uploadPdf(user, 'contract.pdf')
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

  it('applies header sort and persists it across remounts', async () => {
    const user = userEvent.setup()
    const firstRender = renderRoute('/')

    await uploadPdf(user, 'zeta.pdf')
    await uploadPdf(user, 'alpha.pdf')

    const defaultOrder = screen.getAllByRole('button', { name: /View file / })
    expect(defaultOrder[0]).toHaveAccessibleName('View file alpha.pdf')

    await user.click(screen.getByRole('button', { name: 'Sort by name' }))

    const descOrder = screen.getAllByRole('button', { name: /View file / })
    expect(descOrder[0]).toHaveAccessibleName('View file zeta.pdf')

    const storage = window.localStorage as Partial<Storage>
    if (typeof storage.getItem === 'function') {
      expect(storage.getItem('dataroom/view-preferences')).toContain('"sortField":"name"')
      expect(storage.getItem('dataroom/view-preferences')).toContain('"sortDirection":"desc"')
    }

    firstRender.unmount()
    renderRoute('/')

    await uploadPdf(user, 'zeta.pdf')
    await uploadPdf(user, 'alpha.pdf')

    const persistedOrder = screen.getAllByRole('button', { name: /View file / })
    expect(persistedOrder[0]).toHaveAccessibleName('View file zeta.pdf')
  })

  it('switches language to German from header controls', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'DE' }))

    expect(screen.getByRole('link', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Raum' })).toBeInTheDocument()
  })

  it('navigates nested folders from table actions and breadcrumbs', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    await createFolder(user, 'Invoices')

    const breadcrumbs = screen.getByLabelText('Folder breadcrumbs')
    expect(within(breadcrumbs).getByRole('button', { name: 'Finance' })).toBeInTheDocument()
    expect(within(breadcrumbs).getByRole('button', { name: 'Invoices' })).toBeInTheDocument()

    await user.click(within(breadcrumbs).getByRole('button', { name: 'Data Room' }))

    expect(screen.getByRole('button', { name: 'Open folder Finance' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open folder Invoices' })).not.toBeInTheDocument()
  })

  it('rejects non-pdf uploads with a clear error', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderRoute('/')

    await uploadNonPdf(user, 'notes.txt')

    expect(screen.getByText('Only PDF files are allowed.')).toBeInTheDocument()
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument()
  })
})
