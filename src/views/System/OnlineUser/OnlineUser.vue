<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { BaseButton } from '@/components/Button'
import { useSystemStore } from '@/store/modules/system'
import { ElMessage } from 'element-plus'
import { useSSEStore } from '@/store/modules/sse'

const sseStore = useSSEStore()
const systemStore = useSystemStore()
const { getOnlineUserList, forceLogout } = systemStore
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    return await getOnlineUserList()
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
    field: 'ip',
    label: '登录IP'
  },
  {
    field: 'lastLoginAt',
    label: '登录时间',
    width: '265px'
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
            <BaseButton type="danger" onClick={() => forceLogoutFn(data.row.id)}>
              下线
            </BaseButton>
          </>
        )
      }
    }
  }
])

//  这里只是发出 退出 命令
const forceLogoutFn = async (id: number) => {
  const res = await forceLogout(id)
  ElMessage.success(res?.message)
  getList()
}
// 当在线用户变化时 触发更新列表
onMounted(() => {
  sseStore.emitter.on('onlineUser', getList)
})

onBeforeUnmount(() => {
  sseStore.emitter.off('onlineUser', getList)
})
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
