import { defineStore } from 'pinia'
import { store } from '../index'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import { UserItem } from '@/api/user/types'
import { UserLoginType } from '@/api/login/types'
import defaultAvatar from '@/assets/imgs/avatar.jpg'

interface UserState {
  userInfo: UserItem | undefined
  tokenKey: string
  token: string
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  unReadCount: number
}

// const initUserInfo: UserItem = {
//   id: 0,
//   username: '',
//   phone: '',
//   avatar: '',
//   roles: [],
//   departments: [],
//   email: ''
// }
export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'Authorization',
      token: '',
      roleRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: {
        username: '',
        phone: ''
      },
      unReadCount: 0
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token
    },
    getUserInfo(): UserItem | undefined {
      return this.userInfo
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getUserAvatar(): string {
      return this.userInfo?.avatar || defaultAvatar
    },
    getUnReadCount(): number {
      return this.unReadCount
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo?: UserItem) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.roleRouters = roleRouters
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          this.reset()

          // const res = await loginOutApi().catch(() => {})
          // if (res) {
          //   this.reset()
          // }
        })
        .catch(() => {})
    },
    async cmdLogout() {
      // const res = await forceLogoutApi(id).catch(() => {})
      // 这里是收到 强制退出命令    应该做下打点记录  调用登出接口 及 登出原因类型
      this.reset()
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      this.setUserInfo()
      this.setRoleRouters([])
      router.replace('/login')
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    }
    // async setUnReadCount() {
    //   const res = await getUnReadMsgCountApi()
    //   this.unReadCount = res?.total || 0
    // }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
