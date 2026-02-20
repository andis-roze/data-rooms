import { promises as fs } from 'node:fs'
import path from 'node:path'
import po2js from 'gettext-converter/po2js'

const rootDir = process.cwd()
const namespace = 'common'
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales')
const gettextDir = path.join(rootDir, 'gettext')
const enJsonPath = path.join(localesDir, 'en', `${namespace}.json`)
const potPath = path.join(gettextDir, 'messages.pot')

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function readPoKeys(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  const parsed = po2js(content)
  const entries = parsed.translations[''] ?? {}

  return new Set(Object.keys(entries).filter((key) => key !== ''))
}

function diffKeys(expected, actual) {
  const missing = [...expected].filter((key) => !actual.has(key)).sort((a, b) => a.localeCompare(b, 'en'))
  const extra = [...actual].filter((key) => !expected.has(key)).sort((a, b) => a.localeCompare(b, 'en'))

  return { missing, extra }
}

function printDiff(label, { missing, extra }) {
  if (missing.length > 0) {
    console.error(`[i18n:verify-sync] ${label} missing keys (${missing.length}): ${missing.join(', ')}`)
  }

  if (extra.length > 0) {
    console.error(`[i18n:verify-sync] ${label} extra keys (${extra.length}): ${extra.join(', ')}`)
  }
}

async function main() {
  const enCatalog = await readJson(enJsonPath)
  const expectedKeys = new Set(Object.keys(enCatalog))

  let hasError = false

  const potKeys = await readPoKeys(potPath)
  const potDiff = diffKeys(expectedKeys, potKeys)
  if (potDiff.missing.length > 0 || potDiff.extra.length > 0) {
    hasError = true
    printDiff('messages.pot', potDiff)
  }

  const localeEntries = await fs.readdir(localesDir, { withFileTypes: true })
  const locales = localeEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))

  for (const locale of locales) {
    const localeJsonPath = path.join(localesDir, locale, `${namespace}.json`)
    const poPath = path.join(gettextDir, locale, `${namespace}.po`)

    const localeCatalog = await readJson(localeJsonPath)
    const localeKeys = new Set(Object.keys(localeCatalog))
    const localeJsonDiff = diffKeys(expectedKeys, localeKeys)

    if (localeJsonDiff.missing.length > 0 || localeJsonDiff.extra.length > 0) {
      hasError = true
      printDiff(`locales/${locale}/${namespace}.json`, localeJsonDiff)
    }

    const poKeys = await readPoKeys(poPath)
    const poDiff = diffKeys(expectedKeys, poKeys)

    if (poDiff.missing.length > 0 || poDiff.extra.length > 0) {
      hasError = true
      printDiff(`gettext/${locale}/${namespace}.po`, poDiff)
    }
  }

  if (hasError) {
    process.exitCode = 1
    return
  }

  console.log(`[i18n:verify-sync] OK. ${expectedKeys.size} key(s) are synchronized across JSON, POT, and PO files.`)
}

await main()
