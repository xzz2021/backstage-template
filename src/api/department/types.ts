export interface DepartmentItem {
  children?: DepartmentItem[]
  id: number
  name: string
  sort: number | null
  parentId: number | null
  status: boolean
  remark: string
}

export interface DepartmentListResponse {
  list: DepartmentItem[]
}

export interface DepartmentUserParams {
  pageSize: number
  pageIndex: number
  id: string
  username?: string
  account?: string
}

export interface DepartmentUserResponse {
  list: DepartmentUserItem[]
  total: number
}

export interface DepartmentUserItem {
  id: number
  username: string
  account: string
  email: string
  createTime: string
  role: string
  departments: DepartmentItem
  departmentId: number | string
  roles: { id: number; name: string }[] | number[]
  roleArr: any
}
