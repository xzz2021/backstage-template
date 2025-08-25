import request from '@/axios'
import type { BaseResponse, DictionaryList } from './types'

//  此处后端合并了处理分页查询和 带id过滤的分页查询
export const getDictionaryListApi = (): Promise<IResponse<DictionaryList>> => {
  return request.get({ url: '/api/dictionary/all' })
}

export const upsertDictionaryApi = (data) => {
  return request.post({ url: '/api/dictionary/upsert', data })
}

export const delDictionaryApi = (ids: string[]) => {
  return request.post({ url: '/api/dictionary/delete', data: { ids } })
}

//  字典项
export const upsertDicEntryApi = (data) => {
  return request.post<BaseResponse>({ url: '/api/dictionary/entry/upsert', data })
}

export const delDicEntryApi = (ids: number[]) => {
  return request.post({ url: '/api/dictionary/entry/delete', data: { ids } })
}

export const getDicEntryListApi = (params: any): Promise<IResponse<DictionaryList>> => {
  return request.get({ url: '/api/dictionary/entry/list', params })
}

export const addCargoApi = (data: { cargo_name: string }) => {
  return request.post({ url: '/api/dictionary/entry/addcargo', data })
}

export const upsertDictionariesApi = (data: any[]) => {
  return request.post({ url: '/api/dictionary/admin/upsertDictionaries', data })
}
