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

async function openDataRoomActionsMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Actions' }))
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
  const deleteFolderDialog = screen.getByRole('dialog', { name: 'Delete folder?' })
  await user.click(within(deleteFolderDialog).getByRole('button', { name: 'Delete' }))
  await waitForElementToBeRemoved(deleteFolderDialog)
}

async function createDataRoom(user: ReturnType<typeof userEvent.setup>, name: string) {
  await openDataRoomActionsMenu(user)
  await user.click(screen.getByRole('menuitem', { name: 'Create data room' }))
  await user.type(screen.getByRole('textbox', { name: 'Data Room name' }), name)
  await user.click(screen.getByRole('button', { name: 'Create' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create data room' }))
}

async function renameDataRoom(user: ReturnType<typeof userEvent.setup>, nextName: string) {
  await openDataRoomActionsMenu(user)
  await user.click(screen.getByRole('menuitem', { name: 'Rename data room' }))
  const renameDataRoomInput = screen.getByRole('textbox', { name: 'Data Room name' })
  await user.clear(renameDataRoomInput)
  await user.type(renameDataRoomInput, nextName)
  await user.click(screen.getByRole('button', { name: 'Rename' }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Rename data room' }))
}

async function deleteCurrentDataRoom(user: ReturnType<typeof userEvent.setup>) {
  await openDataRoomActionsMenu(user)
  await user.click(screen.getByRole('menuitem', { name: 'Delete data room' }))
  const deleteDataRoomDialog = screen.getByRole('dialog', { name: 'Delete data room?' })
  await user.click(within(deleteDataRoomDialog).getByRole('button', { name: 'Delete' }))
  await waitForElementToBeRemoved(deleteDataRoomDialog)
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

async function goToBreadcrumb(user: ReturnType<typeof userEvent.setup>, name: string) {
  const breadcrumbs = screen.getByLabelText('Folder breadcrumbs')
  await user.click(within(breadcrumbs).getByRole('button', { name }))
}

async function selectMoveDestination(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  destinationName: string,
) {
  await user.click(within(container).getByRole('button', { name: destinationName }))
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

    await openDataRoomActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Create data room' }))
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
    const deleteFileDialog = screen.getByRole('dialog', { name: 'Delete file?' })
    await user.click(within(deleteFileDialog).getByRole('button', { name: 'Delete' }))
    await waitForElementToBeRemoved(deleteFileDialog)

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
  }, 15000)

  it('rejects non-pdf uploads with a clear error', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderRoute('/')

    await uploadNonPdf(user, 'notes.txt')

    expect(screen.getByText('Only PDF files are allowed.')).toBeInTheDocument()
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument()
  })

  it('keeps tree and list checkbox selection in sync for the same folder', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    await goToBreadcrumb(user, 'Data Room')

    const folderTree = screen.getByRole('list', { name: 'Folder tree' })
    const contentList = screen.getByRole('list', { name: 'Current folder contents' })

    const treeFinanceCheckbox = within(folderTree).getByRole('checkbox', { name: 'Select item Finance' })
    const listFinanceCheckbox = within(contentList).getByRole('checkbox', { name: 'Select item Finance' })

    expect(treeFinanceCheckbox).not.toBeChecked()
    expect(listFinanceCheckbox).not.toBeChecked()

    await user.click(treeFinanceCheckbox)
    expect(treeFinanceCheckbox).toBeChecked()
    expect(listFinanceCheckbox).toBeChecked()

    await user.click(listFinanceCheckbox)
    expect(treeFinanceCheckbox).not.toBeChecked()
    expect(listFinanceCheckbox).not.toBeChecked()
  })

  it('supports recursive include with child exclusions even when sibling subfolders exist', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    await goToBreadcrumb(user, 'Data Room')

    const folderTree = screen.getByRole('list', { name: 'Folder tree' })
    await user.click(within(folderTree).getByRole('checkbox', { name: 'Select item Finance' }))

    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    await createFolder(user, 'Invoices')
    await goToBreadcrumb(user, 'Finance')
    await createFolder(user, 'Reports')
    await goToBreadcrumb(user, 'Finance')

    const financeList = screen.getByRole('list', { name: 'Current folder contents' })
    const invoicesCheckbox = within(financeList).getByRole('checkbox', { name: 'Select item Invoices' })
    const reportsCheckbox = within(financeList).getByRole('checkbox', { name: 'Select item Reports' })

    expect(invoicesCheckbox).toBeChecked()
    expect(reportsCheckbox).toBeChecked()

    await user.click(invoicesCheckbox)
    expect(invoicesCheckbox).not.toBeChecked()
    expect(reportsCheckbox).toBeChecked()

    await goToBreadcrumb(user, 'Data Room')
    expect(within(folderTree).getByRole('checkbox', { name: 'Select item Finance' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    const reportsCheckboxInFinance = within(screen.getByRole('list', { name: 'Current folder contents' })).getByRole('checkbox', {
      name: 'Select item Reports',
    })
    await user.click(reportsCheckboxInFinance)

    await goToBreadcrumb(user, 'Data Room')
    expect(within(folderTree).getByRole('checkbox', { name: 'Select item Finance' })).not.toBeChecked()
  }, 30000)

  it('moves selected folders and files to another folder', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Archive')
    await goToBreadcrumb(user, 'Data Room')
    await createFolder(user, 'Finance')
    await goToBreadcrumb(user, 'Data Room')
    await uploadPdf(user, 'terms.pdf')

    const contentList = screen.getByRole('list', { name: 'Current folder contents' })
    await user.click(within(contentList).getByRole('checkbox', { name: 'Select item Finance' }))
    await user.click(within(contentList).getByRole('checkbox', { name: 'Select item terms.pdf' }))
    await user.click(screen.getByRole('button', { name: 'Move' }))

    const moveDialog = screen.getByRole('dialog', { name: 'Move items' })
    await selectMoveDestination(user, moveDialog, 'Data Room / Archive')
    await user.click(within(moveDialog).getByRole('button', { name: 'Move' }))
    await waitForElementToBeRemoved(moveDialog)

    expect(screen.queryByRole('button', { name: 'Open folder Finance' })).not.toBeInTheDocument()
    expect(screen.queryByText('terms.pdf')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open folder Archive' }))
    expect(screen.getByRole('button', { name: 'Open folder Finance' })).toBeInTheDocument()
    expect(screen.getByText('terms.pdf')).toBeInTheDocument()
  }, 20000)

  it('blocks moving a folder into one of its descendants', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    await goToBreadcrumb(user, 'Data Room')
    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    await createFolder(user, 'Invoices')
    await goToBreadcrumb(user, 'Data Room')

    await user.click(screen.getByRole('button', { name: 'Move folder Finance' }))
    const moveDialog = screen.getByRole('dialog', { name: 'Move items' })
    await selectMoveDestination(user, moveDialog, 'Data Room / Finance / Invoices')

    expect(within(moveDialog).getByText('Finance cannot be moved into its own subfolder.')).toBeInTheDocument()
    expect(within(moveDialog).getByRole('button', { name: 'Move' })).toBeDisabled()
  }, 15000)
})
