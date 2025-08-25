import request from '@/axios'
import type { UserType, SmsLoginType, UserRegisterType, SmsLoginRes } from './types'

export const loginApi = (data: UserType): Promise<IResponse<SmsLoginRes>> => {
  return request.post({ url: '/api/auth/login', data })
}

export const smsLoginApi = (data: SmsLoginType): Promise<IResponse<SmsLoginRes>> => {
  return request.post({ url: '/api/auth/sms/login', data })
}

export const registerApi = (data: UserRegisterType): Promise<IResponse<UserType>> => {
  return request.post({ url: 'api/auth/register', data })
}

export const getRoleMenuApi = (): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/api/role/getRoleMenu' })
}

export const getSmsCode = (data: { phone: string; type: string }): Promise<IResponse<string>> => {
  return request.post({ url: '/api/auth/getSmsCode', data })
}

export const smsBind = (data: any): Promise<IResponse<SmsLoginRes>> => {
  return request.post({ url: '/api/auth/sms/bind', data })
}

export const wechatLogin = (code: string): Promise<IResponse<SmsLoginRes>> => {
  return request.post({ url: '/api/auth/wechat/login', data: { code } })
}

export const wechatBind = (data: any): Promise<IResponse<SmsLoginRes>> => {
  return request.post({ url: '/api/auth/wechat/bind', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/api/auth/logout' })
}
