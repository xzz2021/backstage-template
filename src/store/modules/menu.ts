import { defineStore } from 'pinia'
import { getMenuListApi } from '@/api/menu'
export interface MenuState {
  allMenuList: AppCustomRouteRecordRaw[]
  currentMenu: Partial<AppCustomRouteRecordRaw>
}
export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    allMenuList: [],
    currentMenu: {}
  }),
  getters: {
    getAllMenuList: (state) => state.allMenuList,
    getCurrentMenu: (state) => state.currentMenu
  },
  actions: {
    async getMenuList() {
      const res = await getMenuListApi()
      const { list = [], total = 0 } = res
      this.allMenuList = list
      return { list, total }
    },
    async setCurrentMenu(id: number) {
      const menu = this.allMenuList.find((item) => item.id === id)
      this.currentMenu = menu || {}
    }
  },
  persist: []
})
