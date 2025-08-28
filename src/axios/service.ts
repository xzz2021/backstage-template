import axios, { AxiosError } from 'axios'
import { defaultRequestInterceptors, defaultResponseInterceptors } from './config'

import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { REQUEST_TIMEOUT } from '@/constants'

import { useUserStoreWithOut } from '@/store/modules/user'

const errMsg = (msg: string) => {
  ElMessage({
    message: msg?.length > 150 ? msg.slice(0, 150) : msg,
    grouping: true,
    type: 'error'
  })
}
export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  // const url = res.url || ''
  res.signal = controller.signal
  // abortControllerMap.set(
  //   import.meta.env.VITE_USE_MOCK === 'true' ? url.replace('/mock', '') : url,
  //   controller
  // )
  return res
})

//  响应拦截器 一号    1. 优先过滤掉服务端 异常状态码
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)
    // 这里不能做任何处理，否则后面的 interceptors 拿不到完整的上下文了
    return res
  },
  (error: AxiosError) => {
    console.log('err： ' + error) // for debug
    // console.log('xzz2021: error', error)
    let msg = (error.response?.data as any)?.message

    switch (error?.status) {
      case 500:
        msg = msg || '网络异常,或后端服务进程出错!'
        break
      case 404:
        msg = msg || '接口不存在,请联系后端管理员!'
        break
      case 403:
        msg = msg || '当前用户没有操作权限,请联系管理员!'
        break
      case 401:
        msg = msg || '登录过期, 鉴权失败, 请重新登录!'
        break
      default:
        msg = msg || '网络异常,或后端服务进程出错!'
        break
    }
    errMsg(msg)

    if (error?.status == 401) {
      const userStore = useUserStoreWithOut()
      userStore.logout()
    }
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.request.use(defaultRequestInterceptors)
//  响应拦截器 二号
axiosInstance.interceptors.response.use(defaultResponseInterceptors)

const service = {
  request: (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }

      axiosInstance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

export default service
