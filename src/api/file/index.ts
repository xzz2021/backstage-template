import request from '@/axios'

interface UploadFileParams {
  file: File
  // sha256: string
  // remark?: string
  [key: string]: any
}
export const uploadFileApi = (data: UploadFileParams) => {
  return request.post({
    url: 'staticfile/upload',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getFileListApi = (params: any) => {
  return request.get({ url: 'staticfile/list', params })
}

// export const delRoleApi = (id) => {
//   return request.delete({ url: 'role/' + id })
// }

// export const delFileApi = (sha256: string) => {
//   return request.delete({ url: 'staticfile/' + sha256 })
// }
export const deleteFileApi = (ids: number[]) => {
  return request.delete({ url: 'staticfile/delete', data: { ids } })
}
