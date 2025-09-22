// refresh-api.ts
import { useUserStoreWithOut } from '@/store/modules/user'
import axios, { AxiosRequestConfig } from 'axios'
export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

export const refreshApi = axios.create({
  baseURL: PATH_URL, // 或你的后端网关
  withCredentials: true // 让浏览器带上 HttpOnly RT
})

// token-refresher.ts
export type RefreshFn = () => Promise<string> // 返回新的 accessToken

export class TokenRefresher {
  private running: Promise<string> | null = null
  private lastToken: string | null = null
  private lastAt = 0

  constructor(
    private readonly refreshFn: RefreshFn,
    private readonly graceMs = 300 // 可调的缓冲窗口
  ) {}

  /** 尝试刷新：并发去重；成功返回新 token；失败原样抛错（让上层处理） */
  tryRefresh(): Promise<string> {
    // 已有刷新在进行 → 直接复用同一个 Promise
    if (this.running) return this.running

    // 刚刷过（极短时间内的追击 401）→ 直接返回新 token，避免二次刷新
    if (this.lastToken && Date.now() - this.lastAt < this.graceMs) {
      console.log('===========缓存====')
      return Promise.resolve(this.lastToken)
    }

    this.running = this.refreshFn()
      .then((token) => {
        this.lastToken = token // 记录最近一次成功
        this.lastAt = Date.now()
        return token
      })
      .finally(() => {
        // 无论成功失败都重置，下一次401再触发
        this.running = null
      })

    return this.running
  }
}

// 和后端约定：POST /auth/refresh → { accessToken: string }
export const refreshFn = async (): Promise<string> => {
  const res = await refreshApi.post('/auth/refresh')
  // console.log('xzz2021: res', res?.data?.data)
  const { access_token } = res?.data?.data || {}
  if (!access_token) throw new Error('No accessToken from /auth/refresh')
  return access_token as string
}

// singleton.ts   //  包裹 class 实现  单例模式
export function singleton<T>(key: string, create: () => T): T {
  const g = globalThis as any
  return (g[key] ??= create())
}

//  开发阶段 有bug 热更新 可能会导致2次new  从而多次请求
const refresher = singleton('refresher', () => new TokenRefresher(refreshFn as RefreshFn, 3000))

export const slientTokenRefresh = async (
  status: number,
  original: (AxiosRequestConfig & { _retry?: boolean }) | undefined
) => {
  const userStore = useUserStoreWithOut()

  //  这里的if作用进行版本token 快照比对   假如原始token和现有的不一致  说明之前已经请求过了  所以直接使用store的就行了
  // const originalToken = original?.headers && original.headers['Authorization']
  // console.log('originalToken', originalToken)
  // if (userStore.getToken && original?.headers && originalToken !== 'bearer ' + userStore.getToken) {
  //
  //   console.log('originalToken----=============-----------', userStore.getToken)
  //   original.headers['Authorization'] = 'bearer ' + userStore.getToken
  //   return original
  // }

  const isATExpired = status === 401 || status === 406 //  未授权 或 不接受
  if (isATExpired && original && !original._retry) {
    original._retry = true // 防死循环

    try {
      // ✨ 只做刷新本职；内部自动并发去重
      const newToken = await refresher.tryRefresh()
      userStore.setToken(newToken)

      // 把结果交给你原有体系：更新存储 + 重放这一个请求
      original.headers = original.headers ?? {}
      original.headers['Authorization'] = 'bearer ' + newToken

      // ★ 关键：return 重放 Promise，让调用方拿到“各自”的数据
      return original
    } catch (error: any) {
      if (error?.status === 401) userStore.logout()
      return false
      // 刷新失败 → 交由你原有逻辑统一处理（比如清理状态、跳登录）
      // 这里不弹“登录过期”的 toast，留给下面的统一错误分支处理
    }
  }
}
