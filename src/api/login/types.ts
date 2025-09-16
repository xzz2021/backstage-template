export interface UserLoginType {
  username?: string
  password: string
  phone: string
  captchaText: string
  captchaId: string
}

export interface UserLoginInfoType {
  username?: string
  password: string
  phone: string
}

export interface SmsLoginType {
  phone: string
  code: string
}

export type UserRegisterType = UserLoginInfoType & SmsLoginType

export interface UserType {
  id: number
  username: string
  phone: string
  avatar: string
  roles: Array<{ id: number; name: string }>
  department: { id: number; name: string }
  createdAt: string
  email: string
}

export interface SmsLoginRes {
  userinfo: UserType
  access_token: string
}

export interface RefreshTokenRes {
  access_token: string
}
