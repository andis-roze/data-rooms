import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'
import { defaultNamespace, resources } from './resources'

const supportedLanguages = Object.keys(resources)

void i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: defaultNamespace,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n
