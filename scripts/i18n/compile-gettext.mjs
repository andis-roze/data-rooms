import { promises as fs } from 'node:fs'
import path from 'node:path'
import po2i18next from 'gettext-converter/po2i18next'

const rootDir = process.cwd()
const gettextDir = path.join(rootDir, 'gettext')
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales')
const namespace = 'common'

function sortObject(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right, 'en')),
  )
}

function isNonEmptyTranslation(value) {
  return typeof value === 'string' && value.trim().length > 0
}

async function main() {
  const languageEntries = await fs.readdir(gettextDir, { withFileTypes: true })
  const languages = languageEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))

  for (const language of languages) {
    const poPath = path.join(gettextDir, language, `${namespace}.po`)
    const jsonPath = path.join(localesDir, language, `${namespace}.json`)
    const poContent = await fs.readFile(poPath, 'utf8')
    const parsedCatalog = po2i18next(poContent)

    const compiledCatalog =
      language === 'en'
        ? sortObject(parsedCatalog)
        : sortObject(
            Object.fromEntries(
              Object.entries(parsedCatalog).filter(([, value]) => isNonEmptyTranslation(value)),
            ),
          )

    await fs.mkdir(path.dirname(jsonPath), { recursive: true })
    await fs.writeFile(jsonPath, JSON.stringify(compiledCatalog, null, 2) + '\n', 'utf8')
  }
}

await main()
