<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { computed, onMounted, ref, unref, watch } from 'vue'
import { ElTree, ElInput, ElDivider, ElLink } from 'element-plus'
import { useTable } from '@/hooks/web/useTable'
import { Search } from '@/components/Search'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { addUserApi, getUserByDepartmentIdApi, updateUserApi } from '@/api/user'
import type { FormSchema } from '@/components/Form'
import { formatToDateTime } from '@/utils/dateUtil'
import { ElMessage } from 'element-plus'
import { deleteUserByIdsApi } from '@/api/department'
import { TableColumn } from '@/components/Table'
import { storeToRefs } from 'pinia'
import { useDepartmentStore } from '@/store/modules/department'
import { DepartmentItem, DepartmentUserItem } from '@/api/department/types'
import { useRoleStore } from '@/store/modules/role'
import { eachTree } from '@/utils/tree'
const { t } = useI18n()
const { getDepartmentList } = useDepartmentStore()
const departmentStore = useDepartmentStore()
const { departmentList } = storeToRefs(departmentStore)
const roleStore = useRoleStore()
const { roleList } = storeToRefs(roleStore)
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { pageSize, currentPage } = tableState
    const res = await getUserByDepartmentIdApi({
      id: unref(currentNodeKey),
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return res.data
  },
  fetchDelApi: async () => {
    const res = await deleteUserByIdsApi(unref(ids))
    return !!res
  }
})
const { total, loading, dataList, pageSize, currentPage } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref<any>({})
const setSearchParams = (params: any) => {
  currentNodeKey.value = 0
  currentPage.value = 1
  searchParams.value = params
  getList()
  searchParams.value = {}
}

const treeEl = ref<typeof ElTree>()
const tree2FlatList = computed(() => {
  const aa: { id: number; name: string }[] = []
  eachTree(unref(departmentList), (v) => {
    aa.push({ id: v.id, name: v.name })
  })
  return aa
})
const tableColumns = ref<TableColumn[]>([
  {
    label: '用户名',
    field: 'username'
  },
  {
    label: '手机号',
    field: 'phone'
  },
  {
    label: '部门',
    field: 'departments',
    slots: {
      default: (data: any) => {
        const departments = data?.row?.departments
        return departments ? (
          <>
            {unref(tree2FlatList)
              .filter((v) => departments.includes(v.id))
              .map((v) => v.name)
              .join('、')}
          </>
        ) : (
          <></>
        )
      }
    }
  },
  {
    label: '创建时间',
    field: 'createdAt',
    slots: {
      default: (data: any) => {
        return <>{formatToDateTime(data.row.createdAt)}</>
      }
    }
  },
  {
    field: 'roles',
    label: '角色',
    slots: {
      default: (data: any) => {
        const roles = data?.row?.roles
        return roles ? (
          <>
            {unref(roleList)
              .filter((v) => roles.includes(v.id))
              .map((v) => v.name)
              .join('、')}
          </>
        ) : (
          <></>
        )
      }
    }
  },
  {
    label: '操作',
    field: 'action',
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row
        return (
          <>
            <BaseButton type="primary" onClick={() => action(row, 'edit')} disabled={row?.id === 1}>
              {t('exampleDemo.edit')}
            </BaseButton>
            <BaseButton type="success" onClick={() => action(row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton type="danger" onClick={() => delData(row)} disabled={row?.id === 1}>
              {t('exampleDemo.del')}
            </BaseButton>
          </>
        )
      }
    }
  }
])

const currentNodeKey = ref<number>(-1)

const fetchDepartment = async () => {
  await getDepartmentList({})
  // await nextTick()
  // unref(treeEl)?.setCurrentKey(currentNodeKey.value)
}
fetchDepartment()

const currentDepartment = ref('')
watch(
  () => currentDepartment.value,
  (val) => {
    unref(treeEl)!.filter(val)
  }
)

const currentChange = (data: Partial<DepartmentItem>) => {
  currentNodeKey.value = Number(data.id)
  currentPage.value = 1
  getList()
}

const filterNode = (value: string, data: DepartmentItem) => {
  if (!value) return true
  return data.name.includes(value)
}

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<DepartmentUserItem>()
const actionType = ref('')

const delLoading = ref(false)
const ids = ref<string[]>([])

const delData = async (row?: DepartmentUserItem) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.id]
    : elTableExpose?.getSelectionRows().map((v: DepartmentUserItem) => v.id) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = async (row: DepartmentUserItem, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  // type === 'edit' ? (editLoading.value = true) : (detailLoading.value = true)

  currentRow.value = row
  dialogVisible.value = true
  // unref(treeSelectRef)?.setCheckedKeys([row.department.id], true) //  自动选中相应部门
  // unref(treeSelectRef)?.setCurrentKey(row.department.id) //  自动选中相应部
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const searchSchema = ref<FormSchema[]>([
  {
    field: 'username',
    label: t('userDemo.username'),
    component: 'Input'
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input'
  }
])
const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  const isEdit = actionType.value === 'edit' //  判断是修改还是新增
  if (formData) {
    try {
      //  提交 新增 或者 修改
      saveLoading.value = true
      const res = isEdit ? await updateUserApi(formData) : await addUserApi(formData)
      if (res.code === 200) {
        dialogVisible.value = false
        ElMessage.success('更新成功!')
        currentPage.value = 1
        getList()
      }
    } catch (error) {
      console.log('🚀 ~ xzz: save -> error', error)
    } finally {
      saveLoading.value = false
    }
  }
}

onMounted(async () => {
  roleList.value.length == 0 && (await roleStore.getRoleList())
})
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap class="w-250px">
      <div class="flex justify-center items-center">
        <div class="flex-1">{{ t('userDemo.departmentList') }}</div>
        <ElInput
          v-model="currentDepartment"
          class="flex-[2]"
          :placeholder="t('userDemo.searchDepartment')"
          clearable
        />
      </div>
      <ElDivider />
      <ElLink
        type="primary"
        @click="currentChange({ id: 0, name: '所有用户' })"
        class="ml-6 justify-left"
        >所有用户</ElLink
      >
      <ElTree
        ref="treeEl"
        :data="departmentList"
        default-expand-all
        :expand-on-click-node="false"
        node-key="id"
        :current-node-key="currentNodeKey"
        :props="{
          label: 'name'
        }"
        :filter-node-method="filterNode"
        @current-change="currentChange"
      >
        <template #default="{ data }">
          <div :title="data.name" class="whitespace-nowrap overflow-ellipsis overflow-hidden">
            {{ data.name }}
          </div>
        </template>
      </ElTree>
    </ContentWrap>
    <ContentWrap class="flex-[3] ml-20px">
      <Search
        @reset="setSearchParams({ id: -1 })"
        @search="setSearchParams"
        :schema="searchSchema"
      />
      <div class="mb-10px">
        <!-- <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton> -->
        <!-- <BaseButton :loading="delLoading" type="danger" @click="delData()">
          {{ t('exampleDemo.del') }}
        </BaseButton> -->
      </div>
      <Table
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :columns="tableColumns"
        :data="dataList"
        :loading="loading"
        @register="tableRegister"
        :pagination="{
          total
        }"
      />
    </ContentWrap>

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write v-if="actionType !== 'detail'" ref="writeRef" :current-row="currentRow" />
      <Detail v-if="actionType === 'detail'" :current-row="currentRow" />
      <template #footer>
        <BaseButton
          v-if="actionType !== 'detail'"
          type="primary"
          :loading="saveLoading"
          @click="save"
        >
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>
  </div>
</template>
