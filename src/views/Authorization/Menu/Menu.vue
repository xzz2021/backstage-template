<script setup lang="tsx">
import { addMenuApi, delMenuApi, editMenuApi, generateMenuSeedApi, sortMenuApi } from '@/api/menu'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'
import { hasPermi } from '@/components/Permission'
import HasPermission from '@/components/Permission/src/Permission.vue'
import Seed from '@/components/Seed.vue'
import { Table, TableColumn } from '@/components/Table'
import { useRoleMenu } from '@/hooks/fn/useRoleMenu'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { useMenuStore } from '@/store/modules/menu'
import { findNode, treeMapEach } from '@/utils/tree'
import { ElMessage, ElTag } from 'element-plus'
import { storeToRefs } from 'pinia'
import { reactive, ref, unref } from 'vue'
import Detail from './components/Detail.vue'
import SortMenu from './components/SortMenu.vue'
import Write from './components/Write.vue'

const { t } = useI18n()

const delId = ref<number>(0)
const { getRole } = useRoleMenu()
const menuStore = useMenuStore()
const { setCurrentMenu } = menuStore
const { currentMenu } = storeToRefs(menuStore)
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    return await menuStore.getMenuList()
  },
  fetchDelApi: async () => {
    const res = await delMenuApi(unref(delId))
    return !!res
  }
})

const { dataList, loading } = tableState
const { getList, delList } = tableMethods

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: t('userDemo.index'),
    type: 'index'
  },
  {
    field: 'meta.title',
    label: t('menu.menuName'),
    minWidth: 200,
    slots: {
      default: (data: any) => {
        const title = data.row.meta.title
        return <>{t(title)}</>
      }
    }
  },
  {
    field: 'meta.icon',
    label: t('menu.icon'),
    width: 80,
    align: 'center',
    slots: {
      default: (data: any) => {
        const icon = data.row.meta.icon
        return icon ? <Icon icon={icon} /> : null
      }
    }
  },
  {
    field: 'component',
    label: t('menu.component'),
    minWidth: 360,
    slots: {
      default: (data: any) => {
        const component = data.row.component
        return (
          <>
            {component === '#'
              ? t('menu.topDirectory')
              : component === '##'
                ? t('menu.subDirectory')
                : component}
          </>
        )
      }
    }
  },
  {
    field: 'path',
    label: t('menu.path')
  },
  {
    field: 'status',
    label: t('menu.status'),
    minWidth: 90,
    align: 'center',
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElTag type={!data.row.status ? 'danger' : 'success'}>
              {data.row.status ? t('userDemo.enable') : t('userDemo.disable')}
            </ElTag>
          </>
        )
      }
    }
  },
  {
    field: 'action',
    label: t('userDemo.action'),
    fixed: 'right',
    width: 260,
    slots: {
      default: (data: any) => {
        const row = data.row
        return (
          <>
            <BaseButton type="primary" onClick={() => action(row, 'edit')}>
              {t('exampleDemo.edit')}
            </BaseButton>
            <BaseButton type="success" onClick={() => action(row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton
              type="danger"
              disabled={!hasPermi('delete')}
              onClick={() => delAction(row.id)}
            >
              {t('exampleDemo.del')}
            </BaseButton>
          </>
        )
      }
    }
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('')

// const currentRow = ref()
const actionType = ref('')

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const action = (row: any, type: string) => {
  // console.log('🚀 ~ xzz: action -> row', row)
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  // currentRow.value = row
  setCurrentMenu(unref(row))
  dialogVisible.value = true
}

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  // currentRow.value = { status: true }
  setCurrentMenu({ status: true })
  dialogVisible.value = true
  actionType.value = 'add'
}

const delAction = async (idx: number) => {
  delId.value = idx
  await delList(1).finally(() => {})
}

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    try {
      const isEdit = actionType.value === 'edit' //  判断时修改还是新增
      //  提交 新增 或者 修改
      saveLoading.value = true
      const res = isEdit ? await editMenuApi(formData) : await addMenuApi(formData)
      const { code, message } = res
      if (code === 200) {
        dialogVisible.value = false
        ElMessage.success('更新成功!')
        getList()
      } else {
        ElMessage.error('更新失败! 原因: ' + message)
      }
    } catch (error) {
      ElMessage.error('更新失败!原因: ' + error)
    } finally {
      saveLoading.value = false
    }
  }
}

const sortMenuAction = () => {
  dialogTitle.value = t('exampleDemo.sort')
  dialogVisible.value = true
  actionType.value = 'sort'
}

const sortMenuRef = ref<ComponentRef<typeof SortMenu>>()
const saveSort = async () => {
  const sortMenu = unref(sortMenuRef)
  const sortData = sortMenu?.updateData
  if (!sortData?.length) {
    ElMessage.error('请先拖拽排序!')
    return
  }
  // 提交排序
  try {
    const res = await sortMenuApi(sortData)
    if (res?.code === 200) {
      dialogVisible.value = false
      getList()
      ElMessage.success('更新排序成功!')
    }
  } catch (error) {
    console.log('🚀 ~ xzz: saveSort -> error', error)
    ElMessage.error('更新失败!原因: ' + error)
  }
}

const formatDataFn = (data: any[]) => {
  return data.map((item) => {
    const { id, children, permissionList, parentId, meta, ...rest } = item
    // 移除meta和permissionList的id
    if (meta) {
      delete meta.id
    }
    if (permissionList) {
      permissionList.forEach((item: any) => {
        delete item.id
      })
    }

    return {
      ...rest,
      permissionList: permissionList?.length ? permissionList : undefined,
      meta: meta ? meta : undefined,
      children: children?.length ? formatDataFn(children) : undefined
    }
  })
}

const updateListAndCurrentMenu = async () => {
  await getList()
  const id = currentMenu.value?.id || 0
  //  此处不是平面数据  是嵌套的children
  const findNodeData = findNode(dataList.value, (item) => item.id === id)
  setCurrentMenu(findNodeData || {})
}

/*
   name: 'Dashboard',
    path: 'dashboard',
    redirect: '/dashboard/workplace',
    type: 0,
    component: '#',
    sort: 0,
    status: true,


    //  meta

    title: 'router.analysis',
          icon: null,
          affix: false,
          activeMenu: false,
          alwaysShow: false,
          breadcrumb: true,
          canTo: false,
          hidden: false,
          noCache: false,
          noTagsView: false,
*/
const generateMenuSeedData = (data: any[]) => {
  // 后端也有做dto排除字段, 这里可以省略
  return data.map((item) => {
    return treeMapEach(item, {
      conversion: (item) => {
        const { meta, name, path, redirect, type, component, sort, status, permissionList } = item
        const newPermissionList = permissionList.map((item: any) => {
          return {
            name: item.name,
            code: item.code,
            value: item.value,
            resource: item.resource
          }
        })
        const {
          title,
          icon,
          hidden,
          affix,
          activeMenu,
          alwaysShow,
          breadcrumb,
          canTo,
          noCache,
          noTagsView
        } = meta

        return {
          name,
          path,
          redirect,
          type,
          component,
          sort,
          status,
          permissionList: newPermissionList,
          meta: {
            title,
            icon,
            hidden,
            affix,
            activeMenu,
            alwaysShow,
            breadcrumb,
            canTo,
            noCache,
            noTagsView
          }
        }
      }
    })
  })
}
</script>

<template>
  <ContentWrap>
    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton type="primary" @click="sortMenuAction">{{ t('exampleDemo.sort') }}</BaseButton>
      <HasPermission permission="refresh">
        <BaseButton type="success" @click="getRole">{{ t('common.refresh') }}</BaseButton>
        <Seed
          @getList="getList"
          :keyData="{ treeList: generateMenuSeedData(dataList), filename: '菜单' }"
          @generateSeed="generateMenuSeedApi"
        />
      </HasPermission>
    </div>
    <Table
      :columns="tableColumns"
      default-expand-all
      node-key="id"
      :data="dataList"
      :loading="loading"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle" maxHeight="60vh">
    <Write
      v-if="actionType === 'edit' || actionType === 'add'"
      ref="writeRef"
      :current-row="currentMenu"
      @refresh="updateListAndCurrentMenu"
    />

    <Detail v-if="actionType === 'detail'" :current-row="currentMenu" />
    <SortMenu v-if="actionType === 'sort'" ref="sortMenuRef" />
    <template #footer>
      <BaseButton
        v-if="actionType === 'edit' || actionType === 'add'"
        type="primary"
        :loading="saveLoading"
        @click="save"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton
        v-if="actionType === 'sort'"
        type="primary"
        :loading="saveLoading"
        @click="saveSort"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
