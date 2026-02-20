import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'src')
const localesDir = path.join(sourceDir, 'i18n', 'locales')
const namespace = 'common'

const ALWAYS_KEEP_KEYS = new Set([])

function sortObject(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right, 'en')),
  )
}

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
      continue
    }

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath, files)
      continue
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function collectKeys(text, keySet) {
  const patterns = [
    /\bt\(\s*['"]([^'"]+)['"]/g,
    /\bi18n\.t\(\s*['"]([^'"]+)['"]/g,
    /\btranslate\(\s*['"]([^'"]+)['"]/g,
    /['"]i18n:([^'"]+)['"]/g,
  ]

  for (const re of patterns) {
    re.lastIndex = 0
    let match
    while ((match = re.exec(text)) !== null) {
      keySet.add(match[1])
    }
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(sortObject(value), null, 2) + '\n', 'utf8')
}

async function main() {
  const sourceFiles = await walk(sourceDir)
  const usedKeys = new Set(ALWAYS_KEEP_KEYS)

  for (const filePath of sourceFiles) {
    const content = await fs.readFile(filePath, 'utf8')
    collectKeys(content, usedKeys)
  }

  const languageDirs = (await fs.readdir(localesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))

  for (const language of languageDirs) {
    const jsonPath = path.join(localesDir, language, `${namespace}.json`)
    const catalog = await readJson(jsonPath)
    const filteredCatalog = Object.fromEntries(
      Object.entries(catalog).filter(([key]) => usedKeys.has(key) || ALWAYS_KEEP_KEYS.has(key)),
    )

    const removedKeys = Object.keys(catalog).filter((key) => !(key in filteredCatalog))
    await writeJson(jsonPath, filteredCatalog)

    console.log(
      `[i18n:prune-unused] ${language}: removed ${removedKeys.length} key(s), kept ${Object.keys(filteredCatalog).length}`,
    )

    if (removedKeys.length > 0) {
      console.log(`[i18n:prune-unused] ${language} removed keys: ${removedKeys.join(', ')}`)
    }
  }
}

await main()
