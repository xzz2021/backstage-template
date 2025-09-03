import request from '@/axios'
import { LogItem } from './type'

export const getLogListApi = (
  params?: any
): Promise<IResponse<{ list: LogItem[]; total: number }>> => {
  return request.get({ url: '/api/log/getUserOperationLogList', params })
}

export const delLogApi = (ids: number[]): Promise<IResponse<{ count: number }>> => {
  return request.delete({ url: '/api/log/deleteUserOperationLog', data: { ids } })
}
