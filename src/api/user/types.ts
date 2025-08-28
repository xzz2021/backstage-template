export interface DepartmentItem {
  id: number
  name: string
  children?: DepartmentItem[]
  parentId?: string
}

export interface DepartmentListResponse {
  list: DepartmentItem[]
  total: number
}

export interface DepartmentUserParams {
  pageSize: number
  pageIndex: number
  id: number
  username?: string
  account?: string
}

export interface UserItem {
  id: number
  username: string
  phone: string
  avatar: string
  email?: string
  roles?: { id: number; name: string }[]
  departments?: { id: number; name: string }[]
}

export interface DepartmentUserItem {
  id: string
  username: string
  account: string
  email: string
  createTime: string
  role: string
  department: DepartmentItem
}

export interface DepartmentUserResponse {
  list: DepartmentUserItem[]
  total: number
}
