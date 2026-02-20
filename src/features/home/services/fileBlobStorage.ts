import {
  deleteFileBlob,
  deleteManyFileBlobs,
  putFileBlob,
  type NodeId,
} from '../../dataroom/model'

export interface FileBlobStorageService {
  putBlob: (fileId: NodeId, file: File) => Promise<void>
  deleteBlob: (fileId: NodeId) => Promise<void>
  deleteManyBlobs: (fileIds: NodeId[]) => Promise<void>
}

export const defaultFileBlobStorageService: FileBlobStorageService = {
  putBlob: putFileBlob,
  deleteBlob: deleteFileBlob,
  deleteManyBlobs: deleteManyFileBlobs,
}
