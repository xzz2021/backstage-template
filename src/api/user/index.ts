import request from '@/axios'
import { DepartmentUserParams, UserItem } from './types'
interface IdResponse {
  id: number
}
interface DetailUserResponse {
  department: { id: number; name: string }
  roles: { id: number; name: string }[]
}
// 根据 部门id 进行分页查询
export const getUserByDepartmentIdApi = (
  params: DepartmentUserParams
): Promise<IResponse<{ list: UserItem[]; total: number }>> => {
  return request.get({ url: 'user/listByDepartmentId', params })
}

export const resetPasswordApi = (data): Promise<IResponse<IdResponse>> => {
  return request.post({ url: 'user/resetPassword', data })
}
export const getUserByIdApi = (params: { id: number }) => {
  return request.get<DetailUserResponse>({ url: 'user/detailById', params })
}

export const addUserApi = (data) => {
  return request.post({ url: 'user/add', data })
}

export const updateUserApi = (data): Promise<IResponse> => {
  return request.post({ url: 'user/update', data })
}

//  获取用户  个人   详细信息 包含角色 部门创建时间
export const getPersonByIdApi = (): Promise<IResponse<{ userinfo: UserItem }>> => {
  return request.get({ url: 'user/detailInfo' })
}

// 更新用户信息
export const updatePersonApi = (data) => {
  return request.post({ url: 'user/updatePersonalInfo', data })
}

// 更新用户密码
export const updatePasswordApi = (data) => {
  return request.post({ url: 'user/updatePassword', data })
}

//  表单数据 和 blob一起提交时  无法确定边界
// 上传头像
export const uploadAvatarApi = (data: FormData) => {
  return request.post({
    url: 'user/upload/avatar',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
