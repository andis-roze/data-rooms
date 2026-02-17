const fs = require('node:fs')
const path = require('node:path')

const enCatalogPath = path.resolve(__dirname, 'src/i18n/locales/en/common.json')
const enCatalog = fs.existsSync(enCatalogPath)
  ? JSON.parse(fs.readFileSync(enCatalogPath, 'utf8'))
  : {}

module.exports = {
  locales: ['en'],
  defaultNamespace: 'common',
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  createOldCatalogs: false,
  keepRemoved: true,
  resetDefaultValueLocale: 'en',
  pluralSeparator: false,
  sort: true,
  indentation: 2,
  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
  },
  defaultValue(locale, namespace, key) {
    if (locale !== 'en') {
      return ''
    }

    return enCatalog[key] ?? key
  },
}
