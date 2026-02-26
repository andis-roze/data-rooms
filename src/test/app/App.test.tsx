import { fireEvent, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from '../../app/providers/AppProviders'
import { appRoutes } from '../../app/router'
import {
  clearDataRoomState,
  createFolder as createFolderInState,
  createSeedDataRoomState,
  dataRoomStorageKey,
  saveDataRoomState,
} from '../../features/dataroom/model'
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

function seedRootFolders(count: number) {
  const baseNow = Date.now()
  let state = createSeedDataRoomState(baseNow)
  const dataRoomId = state.dataRoomOrder[0]
  const rootFolderId = state.dataRoomsById[dataRoomId]?.rootFolderId

  if (!rootFolderId) {
    return
  }

  for (let index = 1; index <= count; index += 1) {
    const padded = index.toString().padStart(2, '0')
    state = createFolderInState(state, {
      dataRoomId,
      parentFolderId: rootFolderId,
      folderId: `folder-seed-${padded}`,
      folderName: `Folder ${padded}`,
      now: baseNow + index,
    })
  }

  saveDataRoomState(state)
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

async function uploadFiles(
  user: ReturnType<typeof userEvent.setup>,
  files: Array<{ name: string; mimeType: string; contents?: string }>,
): Promise<void> {
  const uploadInput = screen.getByTestId('upload-pdf-input') as HTMLInputElement
  await user.upload(
    uploadInput,
    files.map(({ name, mimeType, contents }) => new File([contents ?? 'test file'], name, { type: mimeType })),
  )
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

function createMockDataTransfer() {
  const dataByType = new Map<string, string>()
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: (type: string, value: string) => {
      dataByType.set(type, value)
    },
    getData: (type: string) => dataByType.get(type) ?? '',
    clearData: () => {
      dataByType.clear()
    },
    files: [],
    items: [],
    types: [],
  }
}

function dragAndDrop(source: Element, destination: Element) {
  const dataTransfer = createMockDataTransfer()
  fireEvent.dragStart(source, { dataTransfer })
  fireEvent.dragEnter(destination, { dataTransfer })
  fireEvent.dragOver(destination, { dataTransfer })
  fireEvent.drop(destination, { dataTransfer })
  fireEvent.dragEnd(source, { dataTransfer })
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
    expect(screen.getByRole('button', { name: 'Upload one or more PDF files' })).toBeInTheDocument()
    expect(screen.getByText('Upload PDFs')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Room' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Data Rooms' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Folder tree' })).not.toBeInTheDocument()
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

  it('auto-focuses folder name input in create and rename dialogs', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Create folder' }))
    expect(screen.getByRole('textbox', { name: 'Folder name' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create folder' }))

    await createFolder(user, 'Finance')
    await user.click(screen.getByRole('button', { name: 'Data Room' }))
    await user.click(screen.getByRole('button', { name: 'Rename folder Finance' }))
    expect(screen.getByRole('textbox', { name: 'Folder name' })).toHaveFocus()
  }, 15000)

  it('auto-focuses data room name input in create and rename dialogs', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await openDataRoomActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Create data room' }))
    expect(screen.getByRole('textbox', { name: 'Data Room name' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog', { name: 'Create data room' }))

    await createDataRoom(user, 'Project Zephyr')
    await openDataRoomActionsMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Rename data room' }))
    expect(screen.getByRole('textbox', { name: 'Data Room name' })).toHaveFocus()
  }, 15000)

  it('keeps current folder selected after creating a child folder', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    await createFolder(user, 'Invoices')

    const breadcrumbs = screen.getByLabelText('Folder breadcrumbs')
    expect(within(breadcrumbs).getByRole('button', { name: 'Finance' })).toBeInTheDocument()
    expect(within(breadcrumbs).queryByRole('button', { name: 'Invoices' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open folder Invoices' })).toBeInTheDocument()
  }, 15000)

  it('selects newly created folder and uploaded file without navigating into them', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    expect(screen.getByRole('checkbox', { name: 'Select item Finance' })).not.toBeChecked()
    const financeRow = screen.getByRole('button', { name: 'Open folder Finance' }).closest('li')
    expect(financeRow).not.toBeNull()
    expect(financeRow).toHaveAttribute('data-row-highlighted', 'true')
    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    await goToBreadcrumb(user, 'Data Room')
    const financeRowAfterOpen = screen.getByRole('button', { name: 'Open folder Finance' }).closest('li')
    expect(financeRowAfterOpen).not.toBeNull()
    expect(financeRowAfterOpen).toHaveAttribute('data-row-highlighted', 'false')

    await uploadPdf(user, 'contract.pdf')
    expect(screen.getByRole('checkbox', { name: 'Select item contract.pdf' })).not.toBeChecked()
    const contractRow = screen.getByRole('button', { name: 'View file contract.pdf' }).closest('li')
    expect(contractRow).not.toBeNull()
    expect(contractRow).toHaveAttribute('data-row-highlighted', 'true')
    await user.click(screen.getByRole('button', { name: 'View file contract.pdf' }))
    const previewDialog = screen.getByRole('dialog', { name: 'contract.pdf' })
    await user.click(within(previewDialog).getByRole('button', { name: 'Close' }))
    await waitForElementToBeRemoved(previewDialog)
    const contractRowAfterOpen = screen.getByRole('button', { name: 'View file contract.pdf' }).closest('li')
    expect(contractRowAfterOpen).not.toBeNull()
    expect(contractRowAfterOpen).toHaveAttribute('data-row-highlighted', 'false')
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

  it('creates the first data room from an empty persisted state', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem(
      dataRoomStorageKey(),
      JSON.stringify({
        schemaVersion: 1,
        dataRoomOrder: [],
        dataRoomsById: {},
        foldersById: {},
        filesById: {},
      }),
    )

    renderRoute('/')

    expect(screen.getByRole('heading', { name: 'No Data Room available' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Data Rooms' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create data room' }))
    await user.type(screen.getByRole('textbox', { name: 'Data Room name' }), 'Project Helios')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('heading', { name: 'Project Helios' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Data Rooms' })).toBeInTheDocument()
    expect(screen.getByText('This folder is empty')).toBeInTheDocument()
  }, 15000)

  it('switches active data room from sidebar list and clears previous row highlight', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Finance')
    const financeRowBeforeSwitch = screen.getByRole('button', { name: 'Open folder Finance' }).closest('li')
    expect(financeRowBeforeSwitch).not.toBeNull()
    expect(financeRowBeforeSwitch).toHaveAttribute('data-row-highlighted', 'true')

    await createDataRoom(user, 'Project Zephyr')
    await user.click(screen.getByRole('button', { name: 'Acme Due Diligence Room' }))
    expect(screen.getByRole('heading', { name: 'Acme Due Diligence Room' })).toBeInTheDocument()

    const financeRowAfterSwitch = screen.getByRole('button', { name: 'Open folder Finance' }).closest('li')
    expect(financeRowAfterSwitch).not.toBeNull()
    expect(financeRowAfterSwitch).toHaveAttribute('data-row-highlighted', 'false')
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

  it('paginates list view and allows changing items per page', async () => {
    const user = userEvent.setup()
    seedRootFolders(11)
    renderRoute('/')

    const listButtonsPageOne = screen.getAllByRole('button', { name: /Open folder Folder / })
    expect(listButtonsPageOne).toHaveLength(10)

    await user.click(screen.getAllByRole('button', { name: 'Next page' })[0])
    const listButtonsPageTwo = screen.getAllByRole('button', { name: /Open folder Folder / })
    expect(listButtonsPageTwo).toHaveLength(1)
    expect(screen.getAllByText('Page 2 / 2')).toHaveLength(2)

    await user.click(screen.getAllByRole('combobox', { name: 'Items per page' })[0])
    await user.click(screen.getByRole('option', { name: '25' }))

    const listButtonsExpanded = screen.getAllByRole('button', { name: /Open folder Folder / })
    expect(listButtonsExpanded).toHaveLength(11)
    expect(screen.getAllByText('Page 1 / 1')).toHaveLength(2)

    await user.click(screen.getAllByRole('combobox', { name: 'Items per page' })[0])
    await user.click(screen.getByRole('option', { name: '10' }))

    await user.click(screen.getAllByRole('button', { name: /Open folder Folder / })[0])
    await goToBreadcrumb(user, 'Data Room')
    expect(screen.getAllByText('Page 1 / 2')).toHaveLength(2)
  }, 60000)

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
    await user.click(screen.getByRole('button', { name: 'Open folder Finance' }))
    await createFolder(user, 'Invoices')
    await user.click(screen.getByRole('button', { name: 'Open folder Invoices' }))

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

  it('uploads multiple PDFs selected in one action', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await uploadFiles(user, [
      { name: 'alpha.pdf', mimeType: 'application/pdf', contents: '%PDF-1.4 alpha' },
      { name: 'beta.pdf', mimeType: 'application/pdf', contents: '%PDF-1.4 beta' },
    ])

    expect(screen.getByRole('button', { name: 'View file alpha.pdf' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View file beta.pdf' })).toBeInTheDocument()
    expect(screen.getByText('Uploaded 2 PDF file(s).')).toBeInTheDocument()
  })

  it('handles mixed multi-file upload outcomes independently', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderRoute('/')

    await uploadFiles(user, [
      { name: 'contract.pdf', mimeType: 'application/pdf', contents: '%PDF-1.4 contract 1' },
      { name: 'contract.pdf', mimeType: 'application/pdf', contents: '%PDF-1.4 contract 2' },
      { name: 'notes.txt', mimeType: 'text/plain', contents: 'plain text' },
    ])

    expect(screen.getByRole('button', { name: 'View file contract.pdf' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View file notes.txt' })).not.toBeInTheDocument()
    expect(screen.getByText('Uploaded 1 PDF file(s).')).toBeInTheDocument()
    expect(screen.getByText('1 file(s) skipped because a file with the same name already exists.')).toBeInTheDocument()
    expect(screen.getByText('1 file(s) skipped because only PDF files are allowed.')).toBeInTheDocument()
  })

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
  }, 40000)

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
  }, 30000)

  it('drags selected file to a visible destination folder row', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Archive')
    await goToBreadcrumb(user, 'Data Room')
    await uploadPdf(user, 'dragged.pdf')

    const list = screen.getByRole('list', { name: 'Current folder contents' })
    await user.click(within(list).getByRole('checkbox', { name: 'Select item dragged.pdf' }))

    const sourceButton = within(list).getByRole('button', { name: 'View file dragged.pdf' })
    const sourceRow = sourceButton.closest('li')
    const destinationButton = within(list).getByRole('button', { name: 'Open folder Archive' })
    const destinationRow = destinationButton.closest('li')

    expect(sourceRow).not.toBeNull()
    expect(destinationRow).not.toBeNull()

    dragAndDrop(sourceRow as Element, destinationRow as Element)

    expect(screen.queryByText('dragged.pdf')).not.toBeInTheDocument()

    await user.click(destinationButton)
    expect(screen.getByText('dragged.pdf')).toBeInTheDocument()
  }, 15000)

  it('dragging an unselected file moves only that file even if another file is selected', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await createFolder(user, 'Archive')
    await goToBreadcrumb(user, 'Data Room')
    await uploadPdf(user, 'selected.pdf')
    await uploadPdf(user, 'dragged-only.pdf')

    const list = screen.getByRole('list', { name: 'Current folder contents' })
    await user.click(within(list).getByRole('checkbox', { name: 'Select item selected.pdf' }))

    const draggedButton = within(list).getByRole('button', { name: 'View file dragged-only.pdf' })
    const draggedRow = draggedButton.closest('li')
    const destinationButton = within(list).getByRole('button', { name: 'Open folder Archive' })
    const destinationRow = destinationButton.closest('li')

    expect(draggedRow).not.toBeNull()
    expect(destinationRow).not.toBeNull()
    dragAndDrop(draggedRow as Element, destinationRow as Element)

    expect(screen.getByText('selected.pdf')).toBeInTheDocument()
    expect(screen.queryByText('dragged-only.pdf')).not.toBeInTheDocument()

    await user.click(destinationButton)
    expect(screen.getByText('dragged-only.pdf')).toBeInTheDocument()
    expect(screen.queryByText('selected.pdf')).not.toBeInTheDocument()
  }, 15000)

})
