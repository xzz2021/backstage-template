// refresh-api.ts
import axios from 'axios'
export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

export const refreshApi = axios.create({
  baseURL: PATH_URL, // 或你的后端网关
  withCredentials: true // 让浏览器带上 HttpOnly RT
})

// token-refresher.ts
export type RefreshFn = () => Promise<string> // 返回新的 accessToken

export class TokenRefresher {
  private running: Promise<string> | null = null

  constructor(private readonly refreshFn: RefreshFn) {}

  /** 尝试刷新：并发去重；成功返回新 token；失败原样抛错（让上层处理） */
  tryRefresh(): Promise<string> {
    // 已有刷新在进行 → 直接复用同一个 Promise
    if (this.running) return this.running

    this.running = this.refreshFn()
      .then((token) => token)
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

export const refresher = new TokenRefresher(refreshFn as RefreshFn)
