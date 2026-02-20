import type { NodeNameValidationError } from '../../dataroom/model'

type TranslateFn = (key: string) => string

export function getDataRoomNameValidationMessage(t: TranslateFn, error: NodeNameValidationError): string {
  return error === 'empty' ? t('dataroomErrorDataRoomNameEmpty') : t('dataroomErrorDataRoomNameReserved')
}

export function getFolderNameValidationMessage(t: TranslateFn, error: NodeNameValidationError): string {
  return error === 'empty' ? t('dataroomErrorFolderNameEmpty') : t('dataroomErrorFolderNameReserved')
}

export function getFileNameValidationMessage(t: TranslateFn, error: NodeNameValidationError): string {
  return error === 'empty' ? t('dataroomErrorFileNameEmpty') : t('dataroomErrorFileNameReserved')
}
