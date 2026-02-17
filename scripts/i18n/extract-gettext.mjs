import { promises as fs } from 'node:fs'
import path from 'node:path'
import i18next2po from 'gettext-converter/i18next2po'
import js2po from 'gettext-converter/js2po'
import po2js from 'gettext-converter/po2js'

const rootDir = process.cwd()
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales')
const gettextDir = path.join(rootDir, 'gettext')
const sourceJsonPath = path.join(localesDir, 'en', 'common.json')
const templatePath = path.join(gettextDir, 'messages.pot')
const sourcePoPath = path.join(gettextDir, 'en', 'common.po')

function sortObject(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right, 'en')),
  )
}

function buildTemplatePo(sourcePo) {
  const template = structuredClone(sourcePo)
  template.headers = { ...template.headers, Language: '' }

  const entries = template.translations[''] ?? {}
  for (const [key, entry] of Object.entries(entries)) {
    if (key === '') {
      continue
    }

    entry.msgstr = ['']
  }

  return template
}

function buildCatalogPo({
  language,
  sourceCatalog,
  existingPo,
  seedCatalog,
  includeSourceValues,
}) {
  const baseCatalog = po2js(i18next2po(language, sourceCatalog))
  const baseEntries = baseCatalog.translations['']
  const existingEntries = existingPo?.translations?.[''] ?? {}

  for (const [key, entry] of Object.entries(baseEntries)) {
    if (key === '') {
      continue
    }

    const existingEntry = existingEntries[key]
    if (!existingEntry) {
      const seededValue = seedCatalog?.[key]
      entry.msgstr = [includeSourceValues ? sourceCatalog[key] : seededValue ?? '']
      continue
    }

    entry.msgstr = includeSourceValues
      ? [sourceCatalog[key]]
      : [existingEntry.msgstr?.[0] ?? '']
  }

  if (existingPo?.headers) {
    baseCatalog.headers = {
      ...existingPo.headers,
      Language: language,
    }
  }

  return baseCatalog
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function maybeReadJson(filePath) {
  try {
    return await readJson(filePath)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

async function maybeReadPo(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return po2js(content)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

async function main() {
  const sourceCatalog = sortObject(await readJson(sourceJsonPath))
  const languages = await fs.readdir(localesDir, { withFileTypes: true })
  const supportedLanguages = languages
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))

  const sourcePo = buildCatalogPo({
    language: 'en',
    sourceCatalog,
    existingPo: await maybeReadPo(sourcePoPath),
    seedCatalog: sourceCatalog,
    includeSourceValues: true,
  })
  const templatePo = buildTemplatePo(sourcePo)

  await fs.mkdir(path.dirname(sourcePoPath), { recursive: true })
  await fs.mkdir(path.dirname(templatePath), { recursive: true })
  await fs.writeFile(sourcePoPath, js2po(sourcePo), 'utf8')
  await fs.writeFile(templatePath, js2po(templatePo), 'utf8')

  for (const language of supportedLanguages) {
    if (language === 'en') {
      continue
    }

    const languagePoPath = path.join(gettextDir, language, 'common.po')
    const languageJsonPath = path.join(localesDir, language, 'common.json')
    const languagePo = buildCatalogPo({
      language,
      sourceCatalog,
      existingPo: await maybeReadPo(languagePoPath),
      seedCatalog: await maybeReadJson(languageJsonPath),
      includeSourceValues: false,
    })

    await fs.mkdir(path.dirname(languagePoPath), { recursive: true })
    await fs.writeFile(languagePoPath, js2po(languagePo), 'utf8')
  }
}

await main()
