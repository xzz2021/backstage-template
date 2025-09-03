import request from '@/axios'
// import {  } from './types'

//  此处后端合并了处理分页查询和 带id过滤的分页查询
export const getDepartmentListApi = (params: any): Promise<IResponse> => {
  return request.get({ url: '/api/department/list', params })
}

export const addDepartmentApi = (data) => {
  return request.post({ url: '/api/department/add', data })
}

export const editDepartmentApi = (data) => {
  return request.post({ url: '/api/department/update', data })
}

export const getAllDepartmentListApi = () => {
  return request.get({ url: '/api/department/alllist' })
}

export const deleteUserByIdsApi = (ids: string[]) => {
  return request.delete({ url: '/api/user/delete', data: { ids } })
}

export const delDepartmentApi = (id: number) => {
  return request.delete({ url: '/api/department/delete', data: { id } })
}

export const generateDepartmentSeedApi = (data: any) => {
  return request.post({ url: '/api/department/generateDepartmentSeed', data })
}
