import request from '@/axios'
import { RoleItem } from './type'

export const getRoleListApi = (
  params?: any
): Promise<IResponse<{ list: RoleItem[]; total: number }>> => {
  return request.get({ url: '/api/role/getRoleList', params })
}

export const addRoleApi = (data) => {
  return request.post({ url: '/api/role/add', data })
}

export const editRoleApi = (data) => {
  return request.post({ url: '/api/role/update', data })
}

export const delRoleApi = (id) => {
  return request.delete({ url: '/api/role/' + id })
}

export const generateRoleSeedApi = (data: RoleItem[]): Promise<IResponse<{ success: boolean }>> => {
  return request.post({ url: '/api/role/generateRoleSeed', data })
}
