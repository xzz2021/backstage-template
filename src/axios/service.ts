import axios, { AxiosError } from 'axios'
import { defaultRequestInterceptors, defaultResponseInterceptors } from './config'

import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { REQUEST_TIMEOUT } from '@/constants'

import { useUserStoreWithOut } from '@/store/modules/user'
import { refresher } from './refresh'

const errMsg = (msg: string) => {
  ElMessage({
    message: msg?.length > 150 ? msg.slice(0, 150) : msg,
    grouping: true,
    type: 'error'
  })
}

const tryNewToken = async () => {
  const userStore = useUserStoreWithOut()
  service.cancelAllRequest()
  try {
    const token = await refresher.tryRefresh()
    console.log('xzz2021: tryNewToken -> token', token)
    userStore.setToken(token)
    // 刷新token成功后，继续执行上一次的axios请求  继续发起也没有用  因为没法返回数据给原始调用处
    // await service.retryAllRequest()
    return true
  } catch (error: any) {
    console.log('xzz2021: tryNewToken -> error', error)
    if (error?.status === 401) {
      // service.cancelAllRequest()
      // userStore.logout()
    }
    return false
  }
}
export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

const retryMap: Map<string, InternalAxiosRequestConfig> = new Map()

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  res.signal = controller.signal
  const url = res?.url
  if (url) {
    retryMap.set(url, res)
    abortControllerMap.set(url, controller)
  }
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
  async (error: AxiosError) => {
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
      // case 400:
      //   msg = msg || '后端已知错误!'
      //   break
      default:
        msg = msg || '网络异常,或后端服务进程出错!'
        break
    }
    errMsg(msg)

    if (error?.status == 401) {
      // 先停止所有后续请求
      // service.cancelAllRequest()
      // 再尝试刷新token
      await tryNewToken()
    } else {
      abortControllerMap.delete(error?.config?.url || '')
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
  },
  async retryAllRequest() {
    for (const [_, config] of retryMap) {
      retryMap.delete(config?.url || '')
      const userStore = useUserStoreWithOut()
      const newToken = userStore.getToken ? 'bearer ' + userStore.getToken : ''
      config.headers['Authorization'] = newToken
      newToken && (await service.request(config))
    }
  }
}

export default service
