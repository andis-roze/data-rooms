import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { chromium } from 'playwright'

const APP_URL = 'http://127.0.0.1:4173'
const RECORDINGS_DIR = 'recordings'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Retry until timeout.
    }
    await wait(500)
  }
  throw new Error(`Timed out waiting for app server at ${url}`)
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    stdio: 'inherit',
    env: process.env,
  })

  const cleanup = () => {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  return child
}

async function runWalkthrough(page) {
  page.setDefaultTimeout(20_000)

  const step = async (title, action) => {
    console.log(`\n▶ ${title}`)
    await action()
    await page.waitForTimeout(700)
  }

  const createFolder = async (name) => {
    await page.getByRole('button', { name: 'Create folder' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create folder' })
    await dialog.getByRole('textbox', { name: 'Folder name' }).fill(name)
    await dialog.getByRole('button', { name: 'Create' }).click()
    await dialog.waitFor({ state: 'hidden' })
  }

  const openDataRoomActions = async () => {
    await page.locator('aside').getByRole('button', { name: 'Actions' }).click()
  }

  const goToBreadcrumb = async (name) => {
    await page.getByLabel('Folder breadcrumbs').getByRole('button', { name }).click()
  }

  const uploadPdf = async (name) => {
    await page.getByTestId('upload-pdf-input').setInputFiles({
      name,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n'),
    })
  }

  await step('Open app', async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { name: 'Acme Due Diligence Room' }).waitFor()
  })

  await step('Create data room', async () => {
    await openDataRoomActions()
    await page.getByRole('menuitem', { name: 'Create data room' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create data room' })
    await dialog.getByRole('textbox', { name: 'Data Room name' }).fill('Project Zephyr')
    await dialog.getByRole('button', { name: 'Create' }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByRole('heading', { name: 'Project Zephyr' }).waitFor()
  })

  await step('Rename data room', async () => {
    await openDataRoomActions()
    await page.getByRole('menuitem', { name: 'Rename data room' }).click()
    const dialog = page.getByRole('dialog', { name: 'Rename data room' })
    await dialog.getByRole('textbox', { name: 'Data Room name' }).fill('Project Apollo')
    await dialog.getByRole('button', { name: 'Rename' }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByRole('heading', { name: 'Project Apollo' }).waitFor()
  })

  await step('Create folder structure', async () => {
    await createFolder('Archive')
    await goToBreadcrumb('Data Room')
    await createFolder('Finance')
    await goToBreadcrumb('Data Room')
  })

  await step('Upload a PDF', async () => {
    await uploadPdf('terms.pdf')
    await page.getByText('terms.pdf').waitFor()
  })

  await step('Bulk move selected folder + file', async () => {
    const contentList = page.getByRole('list', { name: 'Current folder contents' })
    await contentList.getByRole('checkbox', { name: 'Select item Finance' }).click()
    await contentList.getByRole('checkbox', { name: 'Select item terms.pdf' }).click()
    await page.getByRole('button', { name: 'Move' }).click()

    const moveDialog = page.getByRole('dialog', { name: 'Move items' })
    await moveDialog.getByRole('button', { name: 'Data Room / Archive' }).click()
    await moveDialog.getByRole('button', { name: 'Move' }).click()
    await moveDialog.waitFor({ state: 'hidden' })
  })

  await step('Browse folders with breadcrumbs and ".."', async () => {
    await page.getByRole('button', { name: 'Open folder Archive' }).click()
    await page.getByRole('button', { name: 'Open folder Finance' }).click()
    await createFolder('Invoices')
    const parentNavigationButton = page.getByRole('button', { name: 'Open folder ..' })
    if (await parentNavigationButton.count()) {
      await parentNavigationButton.click()
    } else {
      await page.getByRole('button', { name: 'Open folder Invoices' }).click()
      await page.getByRole('button', { name: 'Open folder ..' }).click()
    }
    await goToBreadcrumb('Archive')
  })

  await step('Drag and drop move', async () => {
    await uploadPdf('dragged.pdf')
    const list = page.getByRole('list', { name: 'Current folder contents' })
    await list.getByRole('checkbox', { name: 'Select item dragged.pdf' }).click()

    const sourceRow = list.getByRole('button', { name: 'View file dragged.pdf' }).locator('xpath=ancestor::li')
    const destinationRow = list.getByRole('button', { name: 'Open folder Finance' }).locator('xpath=ancestor::li')
    await sourceRow.dragTo(destinationRow)

    await page.getByRole('button', { name: 'Open folder Finance' }).click()
    await page.getByText('dragged.pdf').waitFor()
    await goToBreadcrumb('Archive')
  })

  await step('Validation message (duplicate folder name)', async () => {
    await createFolder('Validation')
    await goToBreadcrumb('Archive')

    await page.getByRole('button', { name: 'Create folder' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create folder' })
    await dialog.getByRole('textbox', { name: 'Folder name' }).fill('Validation')
    await dialog.getByRole('button', { name: 'Create' }).click()
    await dialog.getByText('Folder with this name already exists in this location.').waitFor()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await dialog.waitFor({ state: 'hidden' })
  })

  await step('Bulk delete flow with confirm dialog', async () => {
    const contentList = page.getByRole('list', { name: 'Current folder contents' })
    await contentList.getByRole('checkbox', { name: 'Select item Finance' }).click()
    await page.getByRole('button', { name: 'Delete selected' }).click()

    const deleteDialog = page.getByRole('dialog', { name: 'Delete selected items?' })
    await deleteDialog.getByRole('button', { name: 'Cancel' }).click()
    await deleteDialog.waitFor({ state: 'hidden' })

    await page.getByRole('button', { name: 'Delete selected' }).click()
    const deleteDialogConfirm = page.getByRole('dialog', { name: 'Delete selected items?' })
    await deleteDialogConfirm.getByRole('button', { name: 'Delete' }).click()
    await deleteDialogConfirm.waitFor({ state: 'hidden' })
  })

  await step('Switch language to DE and back to EN', async () => {
    await page.getByRole('button', { name: 'DE' }).click()
    await page.getByRole('link', { name: 'Start' }).waitFor()
    await page.getByRole('button', { name: 'EN' }).click()
    await page.getByRole('link', { name: 'Home' }).waitFor()
  })

  await step('Sort content by name', async () => {
    await page.getByRole('button', { name: 'Sort by name' }).click()
  })
}

async function main() {
  await mkdir(RECORDINGS_DIR, { recursive: true })

  console.log('Starting dev server...')
  const server = startDevServer()

  try {
    await waitForServer(APP_URL)

    console.log('Launching browser and recording walkthrough...')
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1600, height: 900 },
      recordVideo: {
        dir: RECORDINGS_DIR,
        size: { width: 1600, height: 900 },
      },
    })

    const page = await context.newPage()
    const video = page.video()

    await runWalkthrough(page)

    await context.close()
    await browser.close()

    const videoPath = await video?.path()
    if (videoPath) {
      console.log(`\nWalkthrough video saved to: ${videoPath}`)
    } else {
      console.log('\nWalkthrough complete. No video path returned.')
    }
  } finally {
    if (!server.killed) {
      server.kill('SIGTERM')
    }
  }
}

main().catch((error) => {
  console.error('\nFailed to record UX walkthrough:')
  console.error(error)
  process.exitCode = 1
})
