import deCommon from './locales/de/common.json'
import enCommon from './locales/en/common.json'

export const defaultNamespace = 'common'

export const resources = {
  en: {
    common: enCommon,
  },
  de: {
    common: deCommon,
  },
} as const

export type AppResources = typeof resources
export type AppLanguage = keyof AppResources
