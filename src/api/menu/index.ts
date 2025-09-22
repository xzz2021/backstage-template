import request from '@/axios'

export const getMenuListApi = async (): Promise<
  IResponse<{
    list: AppCustomRouteRecordRaw[]
    total: number
  }>
> => {
  return request.get({ url: 'menu/getMenuList' })
}

export const addMenuApi = (data) => {
  console.log('data', data)
  return request.post({ url: 'menu/add', data })
}

export const editMenuApi = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: 'menu/update', data })
}

export const delMenuApi = (id) => {
  return request.delete({ url: 'menu/' + id })
}

export const addPermission = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: 'permission/add', data })
}
export const updatePermission = (data): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: 'permission/update', data })
}
export const delPermission = (id): Promise<IResponse<{ id: number }>> => {
  return request.delete({ url: 'permission/' + id })
}

export const sortMenuApi = (data) => {
  return request.post({ url: 'menu/sort', data: { data } })
}

export const batchCreatePermissionApi = (data: {
  menuId: number
}): Promise<IResponse<{ count: number }>> => {
  return request.post({ url: 'permission/batchCreate', data })
}

export const generateMenuSeedApi = (data) => {
  return request.post({ url: 'menu/generateMenuSeed', data: { data } })
}
