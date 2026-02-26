import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { strToU8, zipSync } from 'fflate'
import { chromium, firefox, webkit } from 'playwright'

function readArg(name) {
  const prefix = `--${name}=`
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length)
    }
  }
  return null
}

function asNumber(value, fallback) {
  if (!value) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:4173'
const RECORDINGS_DIR = process.env.RECORDINGS_DIR || 'recordings'
const START_LOCAL_SERVER = process.env.START_LOCAL_SERVER !== '0'
const BROWSER = process.env.BROWSER || 'chromium'
const STEP_DELAY_MS = asNumber(readArg('step-delay-ms') ?? process.env.DEMO_STEP_DELAY_MS, 1800)
const ACTION_DELAY_MS = asNumber(readArg('action-delay-ms') ?? process.env.DEMO_ACTION_DELAY_MS, 300)

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
  await page.setViewportSize({ width: 1600, height: 900 })

  const installStepOverlay = async () => {
    await page.evaluate(() => {
      if (document.getElementById('demo-step-overlay')) {
        return
      }

      const overlay = document.createElement('div')
      overlay.id = 'demo-step-overlay'
      overlay.setAttribute('aria-hidden', 'true')
      overlay.style.position = 'fixed'
      overlay.style.top = '16px'
      overlay.style.right = '16px'
      overlay.style.zIndex = '2147483647'
      overlay.style.width = '420px'
      overlay.style.padding = '14px 16px'
      overlay.style.pointerEvents = 'none'
      overlay.style.borderRadius = '12px'
      overlay.style.background = 'rgba(17, 24, 39, 0.9)'
      overlay.style.color = '#ffffff'
      overlay.style.fontFamily = 'Manrope, system-ui, sans-serif'
      overlay.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.25)'
      overlay.style.lineHeight = '1.35'
      overlay.innerHTML = '<div id="demo-step-title" style="font-size:18px;font-weight:800;margin-bottom:6px;"></div><div id="demo-step-note" style="font-size:14px;opacity:0.95;"></div>'
      document.body.appendChild(overlay)
    })
  }

  const updateStepOverlay = async (title, note) => {
    await page.evaluate(
      ({ nextTitle, nextNote }) => {
        const titleElement = document.getElementById('demo-step-title')
        const noteElement = document.getElementById('demo-step-note')
        if (titleElement) {
          titleElement.textContent = nextTitle
        }
        if (noteElement) {
          noteElement.textContent = nextNote
        }
      },
      { nextTitle: title, nextNote: note },
    )
  }

  const step = async (title, note, action) => {
    console.log(`\n▶ ${title}`)
    await updateStepOverlay(title, note)
    await page.waitForTimeout(STEP_DELAY_MS)
    await action()
    await page.waitForTimeout(STEP_DELAY_MS)
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

  const uploadFiles = async (files) => {
    await page.getByTestId('upload-pdf-input').setInputFiles(files)
  }

  const createZipArchive = () =>
    zipSync({
      'zip-included.pdf': strToU8('%PDF-1.4 zip-included'),
      'nested/ignored.txt': strToU8('not a pdf'),
      'nested/also-included.pdf': strToU8('%PDF-1.4 also-included'),
    })

  await step('Open app', 'Load the live demo and wait for the default data room.', async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle' })
    await installStepOverlay()
    await page.getByRole('heading', { name: 'Acme Due Diligence Room' }).waitFor()
  })

  await step('Create data room', 'Open sidebar actions and create a new data room.', async () => {
    await openDataRoomActions()
    await page.getByRole('menuitem', { name: 'Create data room' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create data room' })
    await dialog.getByRole('textbox', { name: 'Data Room name' }).fill('Project Zephyr')
    await dialog.getByRole('button', { name: 'Create' }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByRole('heading', { name: 'Project Zephyr' }).waitFor()
  })

  await step('Rename data room', 'Rename the active data room through sidebar actions.', async () => {
    await openDataRoomActions()
    await page.getByRole('menuitem', { name: 'Rename data room' }).click()
    const dialog = page.getByRole('dialog', { name: 'Rename data room' })
    await dialog.getByRole('textbox', { name: 'Data Room name' }).fill('Project Apollo')
    await dialog.getByRole('button', { name: 'Rename' }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByRole('heading', { name: 'Project Apollo' }).waitFor()
  })

  await step('Create folder structure', 'Create Archive and Finance folders at root level.', async () => {
    await createFolder('Archive')
    await goToBreadcrumb('Data Room')
    await createFolder('Finance')
    await goToBreadcrumb('Data Room')
  })

  await step('Upload a PDF', 'Upload a sample PDF into the current folder.', async () => {
    await uploadPdf('terms.pdf')
    await page.getByText('terms.pdf').waitFor()
  })

  await step(
    'Upload multiple files at once',
    'Use one picker action to upload two PDFs and ignore a non-PDF in the same selection.',
    async () => {
      await uploadFiles([
        {
          name: 'bulk-1.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 bulk-1'),
        },
        {
          name: 'bulk-2.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 bulk-2'),
        },
        {
          name: 'ignore-me.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('ignore'),
        },
      ])
      await page.getByText('bulk-1.pdf').waitFor()
      await page.getByText('bulk-2.pdf').waitFor()
    },
  )

  await step(
    'Upload archive and extract PDFs',
    'Upload a ZIP archive; only PDF entries from the archive are imported.',
    async () => {
      await uploadFiles([
        {
          name: 'bundle.zip',
          mimeType: 'application/zip',
          buffer: Buffer.from(createZipArchive()),
        },
      ])
      await page.getByText('zip-included.pdf').waitFor()
      await page.getByText('also-included.pdf').waitFor()
    },
  )

  await step('Bulk move selected folder + file', 'Select multiple items and move them to Archive.', async () => {
    const contentList = page.getByRole('list', { name: 'Current folder contents' })
    await contentList.getByRole('checkbox', { name: 'Select item Finance' }).click()
    await page.waitForTimeout(ACTION_DELAY_MS)
    await contentList.getByRole('checkbox', { name: 'Select item terms.pdf' }).click()
    await page.waitForTimeout(ACTION_DELAY_MS)
    await page.getByRole('button', { name: 'Move', exact: true }).click()

    const moveDialog = page.getByRole('dialog', { name: 'Move items' })
    await moveDialog.getByRole('button', { name: 'Data Room / Archive' }).click()
    await moveDialog.getByRole('button', { name: 'Move' }).click()
    await moveDialog.waitFor({ state: 'hidden' })
  })

  await step('Browse folders with breadcrumbs and ".."', 'Navigate via folder rows, breadcrumbs, and parent entry.', async () => {
    await page.getByRole('button', { name: 'Open folder Archive' }).click()
    await page.waitForTimeout(ACTION_DELAY_MS)
    await page.getByRole('button', { name: 'Open folder Finance' }).click()
    await createFolder('Invoices')
    const parentNavigationButton = page.getByRole('button', { name: 'Open folder ..' })
    if (await parentNavigationButton.count()) {
      await parentNavigationButton.click()
    } else {
      await goToBreadcrumb('Archive')
    }
    await goToBreadcrumb('Archive')
  })

  await step('Drag and drop move', 'Drag a selected file and drop it onto a destination folder.', async () => {
    await uploadPdf('dragged.pdf')
    const list = page.getByRole('list', { name: 'Current folder contents' })
    await list.getByRole('checkbox', { name: 'Select item dragged.pdf' }).click()

    const sourceRow = list.getByRole('button', { name: 'View file dragged.pdf' }).locator('xpath=ancestor::li')
    const destinationRow = list.getByRole('button', { name: 'Open folder Finance' }).locator('xpath=ancestor::li')
    await sourceRow.dragTo(destinationRow)
    await page.waitForTimeout(ACTION_DELAY_MS)

    let fileMoved = false
    await page.getByRole('button', { name: 'Open folder Finance' }).click()
    if (await page.getByText('dragged.pdf').count()) {
      fileMoved = true
    }
    await goToBreadcrumb('Archive')

    if (!fileMoved) {
      await list.getByRole('checkbox', { name: 'Select item dragged.pdf' }).click()
      await sourceRow.dragTo(destinationRow)
      await page.waitForTimeout(ACTION_DELAY_MS)
      await page.getByRole('button', { name: 'Open folder Finance' }).click()
      await page.getByText('dragged.pdf').waitFor()
      await goToBreadcrumb('Archive')
    }
  })

  await step('Validation message (duplicate folder name)', 'Trigger and display duplicate name validation in dialog.', async () => {
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

  await step('Bulk delete flow with confirm dialog', 'Open delete dialog, cancel once, then confirm.', async () => {
    const contentList = page.getByRole('list', { name: 'Current folder contents' })
    await contentList.getByRole('checkbox', { name: 'Select item Finance' }).click()
    await page.getByRole('button', { name: 'Delete selected', exact: true }).click()

    const deleteDialog = page.getByRole('dialog', { name: 'Delete selected items?' })
    await deleteDialog.getByRole('button', { name: 'Cancel' }).click()
    await deleteDialog.waitFor({ state: 'hidden' })

    await page.getByRole('button', { name: 'Delete selected', exact: true }).click()
    const deleteDialogConfirm = page.getByRole('dialog', { name: 'Delete selected items?' })
    await deleteDialogConfirm.getByRole('button', { name: 'Delete' }).click()
    await deleteDialogConfirm.waitFor({ state: 'hidden' })
  })

  await step('Switch language to DE and back to EN', 'Switch UI language to German, then back to English.', async () => {
    await page.getByRole('button', { name: 'DE', exact: true }).click()
    await page.getByRole('link', { name: 'Start' }).waitFor()
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await page.getByRole('link', { name: 'Home' }).waitFor()
  })

  await step('Sort content by name', 'Toggle table sort by name to finish the walkthrough.', async () => {
    await page.getByRole('button', { name: 'Sort by name' }).click()
  })
}

async function main() {
  await mkdir(RECORDINGS_DIR, { recursive: true })
  console.log(`Recorder config: browser=${BROWSER}, stepDelay=${STEP_DELAY_MS}ms, actionDelay=${ACTION_DELAY_MS}ms`)

  const server = START_LOCAL_SERVER ? startDevServer() : null
  if (START_LOCAL_SERVER) {
    console.log('Starting dev server...')
  } else {
    console.log('Skipping local dev server startup (START_LOCAL_SERVER=0)')
  }

  try {
    if (START_LOCAL_SERVER) {
      await waitForServer(APP_URL)
    }

    console.log(`Launching ${BROWSER} and recording walkthrough...`)
    const browserType = BROWSER === 'firefox' ? firefox : BROWSER === 'webkit' ? webkit : chromium
    const browser = await browserType.launch({ headless: true })
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
    if (server && !server.killed) {
      server.kill('SIGTERM')
    }
  }
}

main().catch((error) => {
  console.error('\nFailed to record UX walkthrough:')
  console.error(error)
  process.exitCode = 1
})
