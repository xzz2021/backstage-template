import request from '@/axios'
import type { DictionaryList, DictionaryItem, DictionaryEntry } from './types'

//  此处后端合并了处理分页查询和 带id过滤的分页查询
export const getDictionaryListApi = (): Promise<IResponse<DictionaryList>> => {
  return request.get({ url: '/api/dictionary/list' })
}

export const upsertDictionaryApi = (data: DictionaryItem): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/api/dictionary/upsert', data })
}

export const delDictionaryApi = (ids: number[]): Promise<IResponse<{ count: number }>> => {
  return request.delete({ url: '/api/dictionary/delete', data: { ids } })
}

//  字典项
export const upsertDicEntryApi = (data: DictionaryEntry): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/api/dictionary/entry/upsert', data })
}

export const delDicEntryApi = (ids: number[]): Promise<IResponse<{ count: number }>> => {
  return request.delete({ url: '/api/dictionary/entry/delete', data: { ids } })
}

export const generateDictionarySeedApi = (
  data: DictionaryItem[]
): Promise<IResponse<{ success: boolean }>> => {
  return request.post({ url: '/api/dictionary/generateDictionarySeed', data: { data } })
}
