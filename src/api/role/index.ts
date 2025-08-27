import request from '@/axios'

export const getRoleListApi = (params?: any): Promise<IResponse> => {
  return request.get({ url: '/api/role/getRoleList', params })
}

export const addRoleApi = (data) => {
  return request.post({ url: '/api/role/add', data })
}

export const editRoleApi = (data) => {
  return request.post({ url: '/api/role/update', data })
}

export const getMenuWithPermissionByRoleId = async (id: number) => {
  const res = await request.get({ url: '/api/role/getMenuByRoleId', params: { id } })
  // const newRes = formatToTree(res.list)
  return res
}

export const delRoleApi = (id) => {
  return request.delete({ url: '/api/role/' + id })
}

export const generateRoleSeedApi = (data: any) => {
  return request.post({ url: '/api/role/admin/batchUpsert', data })
}
