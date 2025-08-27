import { defineStore } from 'pinia'
import { getMenuListApi } from '@/api/menu'

export interface DrawerFormData {
  id?: number
  name: string
  code: string
  path: string
}

export interface MenuState {
  allMenuList: AppCustomRouteRecordRaw[]
  currentMenu: Partial<AppCustomRouteRecordRaw>
  drawerFormData: DrawerFormData
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    allMenuList: [],
    currentMenu: {},
    drawerFormData: {
      name: '',
      code: '',
      path: ''
    }
  }),
  getters: {
    getAllMenuList: (state) => state.allMenuList,
    getCurrentMenu: (state) => state.currentMenu,
    getDrawerFormData: (state) => state.drawerFormData
  },
  actions: {
    async getMenuList() {
      const res = await getMenuListApi()
      const { list = [], total = 0 } = res
      this.allMenuList = list
      return { list, total }
    },
    setCurrentMenu(menu: Partial<AppCustomRouteRecordRaw>) {
      this.currentMenu = menu || {}
    },
    setDrawerFormData(data: DrawerFormData) {
      this.drawerFormData = data
    }
  },
  persist: []
})
