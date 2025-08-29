import { delDepartmentApi, getDepartmentListApi } from '@/api/department'
import { DepartmentItem } from '@/api/department/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDepartmentStore = defineStore('department', () => {
  const departmentList = ref<DepartmentItem[]>([])

  const getDepartmentList = async (params?: any) => {
    const res = await getDepartmentListApi(params)
    const { list = [], total = 0 } = res?.data || {}
    departmentList.value = list
    return { list, total }
  }

  const delDepartment = async (id: number) => {
    await delDepartmentApi(id)
  }

  return {
    departmentList,
    getDepartmentList,
    delDepartment
  }
})
