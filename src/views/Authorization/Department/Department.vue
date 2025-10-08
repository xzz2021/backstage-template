<script setup lang="tsx">
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { Search } from '@/components/Search'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { reactive, ref, unref } from 'vue'
import Detail from './components/Detail.vue'
import Write from './components/Write.vue'

import { addDepartmentApi, editDepartmentApi, generateDepartmentSeedApi } from '@/api/department'
import type { DepartmentItem } from '@/api/department/types'
import { FormSchema } from '@/components/Form'
import Seed from '@/components/Seed.vue'
import { Table, TableColumn } from '@/components/Table'
import { useDepartmentStore } from '@/store/modules/department'
import { treeMapEach } from '@/utils/tree'
import { ElMessage, ElSwitch } from 'element-plus'

const { getDepartmentList, delDepartment } = useDepartmentStore()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const params = {
      ...unref(searchParams)
    }
    return await getDepartmentList(params)
  }
})
const { loading, dataList, total } = tableState
const { getList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  loading.value = true
  searchParams.value = params
  getList()
}

const { t } = useI18n()

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<DepartmentItem | null>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delOne = async (id: number) => {
  delLoading.value = true
  await delDepartment(id).finally(() => {
    loading.value = false
  })
  ElMessage.success('删除成功')
  getList()
}
// const delData = async (row: DepartmentItem | null) => {
//   if (row?.children && row?.children?.length > 0)
//     return ElMessage.error('当前部门下有子部门, 不能删除')
//   const elTableExpose = await getElTableExpose()
//   ids.value = row
//     ? [row.id]
//     : elTableExpose?.getSelectionRows().map((v: DepartmentItem) => v.id) || []
//   delLoading.value = true
//   await delList(unref(ids).length).finally(() => {
//     delLoading.value = false
//   })
// }

const action = (row: DepartmentItem, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const tableColumns = reactive<TableColumn[]>([
  // {
  //   field: 'selection',
  //   type: 'selection'
  // },
  {
    field: 'index',
    label: t('tableDemo.index'),
    type: 'index'
  },
  {
    field: 'id',
    label: t('userDemo.departmentName'),

    slots: {
      default: (data: any) => {
        return <>{data.row.name}</>
      }
    }
  },
  {
    field: 'path',
    label: t('menu.path'),
    width: '165px'
  },
  {
    field: 'status',
    label: t('userDemo.status'),
    slots: {
      default: (data: any) => {
        const status = data.row.status
        return (
          <>
            {/* <ElTag type={status ? 'success' : 'danger'}>
              {status ? t('userDemo.enable') : t('userDemo.disable')}
            </ElTag> */}
            <ElSwitch v-model={status} before-change={() => handleStatusChange(data.row)} />
          </>
        )
      }
    }
  },
  // {
  //   field: 'createdAt',
  //   label: t('tableDemo.displayTime'),
  //   width: '165px'
  //   // slots: {
  //   //   default: (data: any) => {
  //   //     return <>{formatToDateTime(data.row.createdAt)}</>
  //   //   }
  //   // }
  // },
  {
    field: 'updatedAt',
    label: t('tableDemo.updatedAt'),
    width: '165px'
  },
  {
    field: 'remark',
    label: t('tableDemo.description')
  },
  {
    field: 'action',
    width: '260px',
    label: t('tableDemo.action'),
    slots: {
      default: (data: any) => {
        return (
          <>
            <BaseButton type="primary" onClick={() => action(data.row, 'edit')}>
              {t('exampleDemo.edit')}
            </BaseButton>
            <BaseButton type="success" onClick={() => action(data.row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton type="danger" onClick={() => delOne(data.row.id)}>
              {t('exampleDemo.del')}
            </BaseButton>
          </>
        )
      }
    }
  }
])

const handleStatusChange = async (row: DepartmentItem) => {
  console.log('🚀 ~ xzz: handleStatusChange -> row', row)
  const res = await editDepartmentApi({ ...row, status: !row.status })
  if (res?.data?.id) {
    ElMessage.success('更新成功!')
    getList()
  }
}

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  const isEdit = actionType.value === 'edit' //  判断是修改还是新增
  if (formData) {
    try {
      delete formData.children
      //  提交 新增 或者 修改
      saveLoading.value = true

      const res = isEdit ? await editDepartmentApi(formData) : await addDepartmentApi(formData)
      if (res?.data?.id) {
        dialogVisible.value = false
        ElMessage.success('更新成功!')
        getList()
      }
    } catch (error) {
      console.log('🚀 ~ xzz: save -> error', error)
    } finally {
      saveLoading.value = false
    }
  }
}

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: t('userDemo.departmentName'),
    component: 'Input'
  },
  {
    field: 'status',
    label: t('userDemo.status'),
    component: 'Select',
    componentProps: {
      options: [
        { label: t('userDemo.enable'), value: true },
        { label: t('userDemo.disable'), value: false }
      ]
    }
  }
])

const generateDepartmentSeedData = (data: DepartmentItem[]) => {
  // 后端也有做dto排除字段, 这里可以省略
  return data.map((item) => {
    return treeMapEach(item, {
      conversion: (item) => {
        const { name, status, remark, children } = item
        if (children && children.length > 0) {
          return { name, status, remark, children: children.length > 0 ? children : undefined }
        }
        return { name, status, remark }
      }
    })
  })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <!-- <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton> -->
      <Seed
        @getList="getList"
        :keyData="{
          treeList: generateDepartmentSeedData(dataList),
          filename: '部门'
        }"
        @generateSeed="generateDepartmentSeedApi"
      />
    </div>

    <Table
      :columns="tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total,
        layout: 'total'
      }"
      :defaultExpandAll="true"
      @register="tableRegister"
      showAction
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
</template>
