import request from '@/axios'

export const getMenuListApi = async (): Promise<{
  list: AppCustomRouteRecordRaw[]
  total: number
}> => {
  return await request.get({ url: '/api/menu/getMenuList' })
}

export const addMenuApi = (data) => {
  console.log('data', data)
  return request.post({ url: '/api/menu/add', data })
}

export const editMenuApi = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/api/menu/update', data })
}

export const delMenuApi = (id) => {
  return request.delete({ url: '/api/menu/' + id })
}

export const addPermission = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/api/permission/add', data })
}
export const updatePermission = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/api/permission/update', data })
}
export const delPermission = (id): Promise<IResponse<{ id: number }>> => {
  return request.delete({ url: '/api/permission/' + id })
}

export const sortMenuApi = (data) => {
  return request.post({ url: '/api/menu/sort', data })
}

export const batchCreatePermissionApi = (data): Promise<IResponse<{ count: number }>> => {
  return request.post({ url: '/api/permission/batchCreate', data })
}

export const generateMenuSeedApi = (data) => {
  return request.post({ url: '/api/menu/admin/batchUpsert', data })
}
