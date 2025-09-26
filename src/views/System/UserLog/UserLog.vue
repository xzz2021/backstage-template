<script setup lang="tsx">
import { delLogApi, getLogListApi } from '@/api/log/index'
import { LogItem } from '@/api/log/type'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { FormSchema } from '@/components/Form'
import { Search } from '@/components/Search'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElTag } from 'element-plus'
import { reactive, ref, unref } from 'vue'
import Detail from './components/Detail.vue'

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const params = {
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    }
    const res = await getLogListApi(params)
    const { list, total } = res.data
    return { list, total }
  },
  fetchDelApi: async () => {
    const res = await delLogApi(unref(ids).map(Number))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref<any>({})
const setSearchParams = (params: any) => {
  const { dateRange, ...rest } = params
  searchParams.value = { ...rest }
  if (dateRange) {
    // 因为是get请求，所以需要将日期格式化成json字符串
    searchParams.value.dateRange = JSON.stringify([
      dateRange[0].toISOString(),
      dateRange[1].toISOString()
    ])
  }
  getList()
}

const { t } = useI18n()

/*
  id        Int     @id @default(autoincrement())
  userId    Int     @map("user_id") 
  target    String  @db.VarChar(50) @map("target")
  ip        String  @db.VarChar(50)
  userAgent String  @db.VarChar(50) @map("user_agent")
  method    String  @db.VarChar(50) 
  requestUrl String  @db.VarChar(50) @map("request_url")
  status    String  @db.VarChar(50) @map("status")

  responseMsg String? @db.VarChar(50) @map("response_msg")
  detailInfo   Json?   @map("detail_info")

*/

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
    field: 'user.username',
    label: '操作人',
    width: '90px',
    align: 'center'
  },
  {
    field: 'status',
    label: '结果',
    width: '90px',
    align: 'center',
    slots: {
      default: (data: any) => {
        const status = data.row.status
        return (
          <ElTag type={status === 'success' ? 'success' : 'danger'}>
            {status === 'success' ? '成功' : '失败'}
          </ElTag>
        )
      }
    }
  },

  {
    field: 'responseMsg',
    label: '响应信息'
  },
  {
    field: 'duration',
    label: '响应时长',
    width: '90px',
    align: 'center'
  },
  {
    field: 'method',
    label: '请求方法',
    width: '90px',
    align: 'center'
  },
  {
    field: 'requestUrl',
    label: '请求路径'
  },
  {
    field: 'ip',
    label: 'IP地址',
    width: '130px'
  },
  {
    field: 'createdAt',
    label: '操作时间'
  },
  {
    field: 'action',
    width: '200px',
    label: t('tableDemo.action'),
    fixed: 'right',
    slots: {
      default: (data: any) => {
        return (
          <>
            <BaseButton type="success" onClick={() => action(data.row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton type="danger" onClick={() => delData(data.row)}>
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

const currentRow = ref<LogItem | null>(null)
const actionType = ref('')

const delLoading = ref(false)

const delData = async (row: LogItem | null) => {
  console.log(row?.id)
  const elTableExpose = await getElTableExpose()
  ids.value = row?.id ? [row.id] : elTableExpose?.getSelectionRows().map((v: LogItem) => v.id) || []
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: LogItem, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const searchSchema = reactive<FormSchema[]>([
  // {
  //   field: 'username',
  //   label: '操作人',
  //   component: 'Input'
  // },
  {
    field: 'requestUrl',
    label: '请求路径',
    component: 'Input'
  },
  {
    field: 'responseMsg',
    label: '响应信息',
    component: 'Input'
  },
  {
    field: 'status',
    label: '结果',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: '成功',
          value: 'success'
        },
        {
          label: '失败',
          value: 'fail'
        }
      ]
    }
  },

  {
    field: 'dateRange',
    label: '操作时间',
    component: 'DatePicker',
    componentProps: {
      type: 'datetimerange',
      format: 'YYYY-MM-DD HH:mm:ss',
      //   valueFormat: 'YYYY-MM-DDTHH:mm:ss',
      disabledDate: (time: Date) => {
        return time.getTime() > Date.now() + 1000 * 60 * 60 * 24
      }
    }
  }
])
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.batchDel') }}
      </BaseButton>
    </div>

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

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Detail :current-row="currentRow" />

    <template #footer>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
