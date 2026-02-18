import type { NodeId } from './types'

const DB_NAME = 'dataroom-files'
const STORE_NAME = 'files'
const DB_VERSION = 1

const fallbackBlobStore = new Map<NodeId, Blob>()
let openRequest: Promise<IDBDatabase> | null = null

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDatabase(): Promise<IDBDatabase> {
  if (!hasIndexedDb()) {
    return Promise.reject(new Error('IndexedDB is not available'))
  }

  if (openRequest) {
    return openRequest
  }

  openRequest = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    }
  })

  return openRequest
}

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode)
        const store = transaction.objectStore(STORE_NAME)
        const request = run(store)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(request.error ?? new Error('IndexedDB request failed'))
        }
      }),
  )
}

export async function putFileBlob(fileId: NodeId, blob: Blob): Promise<void> {
  if (!hasIndexedDb()) {
    fallbackBlobStore.set(fileId, blob)
    return
  }

  await withStore('readwrite', (store) => store.put(blob, fileId))
}

export async function getFileBlob(fileId: NodeId): Promise<Blob | null> {
  if (!hasIndexedDb()) {
    return fallbackBlobStore.get(fileId) ?? null
  }

  const value = await withStore<Blob | undefined>('readonly', (store) => store.get(fileId))
  return value ?? null
}

export async function deleteFileBlob(fileId: NodeId): Promise<void> {
  if (!hasIndexedDb()) {
    fallbackBlobStore.delete(fileId)
    return
  }

  await withStore('readwrite', (store) => store.delete(fileId))
}

export async function deleteManyFileBlobs(fileIds: NodeId[]): Promise<void> {
  await Promise.all(fileIds.map((fileId) => deleteFileBlob(fileId)))
}
