interface userItem {
  id: number
  username: string
  avatar: string
  email: string
  phone: string
}

export interface LogItem {
  id: number
  userInfo: userItem
  target: string
  ip: string
  userAgent: string
  method: string
  requestUrl: string
  status: string
  responseMsg: string
  detailInfo: string
  createTime: string
}

// export interface RoleList {
//   list: Partial<RoleItem>[]
//   total: number
// }
