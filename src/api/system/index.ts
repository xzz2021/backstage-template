import request from '@/axios'
import { UserListResponse } from './types'

//  此处后端合并了处理分页查询和 带id过滤的分页查询
export const getUserListApi = (params: any): Promise<IResponse<UserListResponse>> => {
  return request.get({ url: '/api/user/list', params })
}

export const forceLogoutApi = (id: number): Promise<IResponse> => {
  return request.post({ url: '/api/auth/forceLogout', data: { id } })
}

export const unlockApi = (id: number): Promise<IResponse> => {
  return request.post({ url: '/api/auth/unlock', data: { id } })
}
