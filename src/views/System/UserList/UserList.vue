<script setup lang="tsx">
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { useSystemStore } from '@/store/modules/system'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

const systemStore = useSystemStore()
const { getUserList, unlock } = systemStore
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    return await getUserList()
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const { t } = useI18n()
const tableColumns = reactive<TableColumn[]>([
  {
    field: 'selection',
    type: 'selection'
  },
  {
    field: 'index',
    label: t('tableDemo.index'),
    type: 'index'
  },
  {
    field: 'username',
    label: '用户名',
    align: 'center'
  },

  {
    field: 'phone',
    label: '手机号'
  },
  {
    field: 'lastLoginIp',
    label: '登录IP'
  },
  {
    field: 'lastLoginAt',
    label: '登录时间',
    width: '165px'
  },
  {
    field: 'action',
    // width: '160px',
    label: t('tableDemo.action'),
    // fixed: 'right',
    slots: {
      default: (data: any) => {
        return (
          <>
            <BaseButton
              type="success"
              onClick={() => unlockFn(data.row.id)}
              disabled={!data.row.lockedUntil}
            >
              解锁
            </BaseButton>
          </>
        )
      }
    }
  }
])

const unlockFn = async (id: number) => {
  const res = await unlock(id)
  ElMessage.success(res?.message)
  getList()
}
</script>

<template>
  <ContentWrap>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    />
  </ContentWrap>
</template>
