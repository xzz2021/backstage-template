import { CONTENT_TYPE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import service from './service'
import { throttleWrap } from './throttle'

const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, responseType, withCredentials } = option

  const userStore = useUserStoreWithOut()
  const config = {
    url: url,
    method,
    params,
    data: data,
    responseType: responseType,
    headers: {
      'Content-Type': CONTENT_TYPE,
      [userStore.getTokenKey ?? 'Authorization']: userStore.getToken
        ? 'bearer ' + userStore.getToken
        : '',
      ...headers
    },
    withCredentials
  }
  // return service.request(config) //  返回原始请求   用于测试 后端限流
  return throttleWrap(service.request)(config) //  前端节流请求
}

// const throttledRequest = throttleWrap(request)

export default {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as Promise<IResponse<T>>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as Promise<IResponse<T>>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as Promise<IResponse<T>>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as Promise<IResponse<T>>
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
