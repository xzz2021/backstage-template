<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { ref, unref, onMounted } from 'vue'
import { useTable } from '@/hooks/web/useTable'
// import { Search } from '@/components/Search'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { ElLink } from 'element-plus'
// import type { FormSchema } from '@/components/Form'
import { formatToDateTime } from '@/utils/dateUtil'
import { ElMessage } from 'element-plus'
import TypeWrite from './components/TypeWrite.vue'
import { TableColumn } from '@/components/Table'
import Seed from './components/Seed.vue'
import { storeToRefs } from 'pinia'
import { useClipboard } from '@/hooks/web/useClipboard'
const { t } = useI18n()
import { useDictionaryStore } from '@/store/modules/dictionary'
import { DictionaryEntry } from '@/api/dictionary/types'
const dictionaryStore = useDictionaryStore()
const { allDictionaryList } = storeToRefs(dictionaryStore)
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const dictionaryId = unref(currentNodeKey)
    // 触发更新字典   然后根据id索引到当前list
    const currentDic = unref(allDictionaryList).find((v) => v.id === dictionaryId)
    currentDicKey.value = currentDic?.code || ''
    const currentDicEntry = currentDic?.entries || []
    return {
      list: currentDicEntry,
      total: currentDicEntry.length
    }
  },
  fetchDelApi: async () => {
    await dictionaryStore.deleteDictEntry(unref(ids).map((v) => Number(v)))
    return true
  }
})

const { loading, dataList, pageSize, currentPage } = tableState
const { getList, getElTableExpose, delList } = tableMethods

// const searchParams = ref<{ name?: string; code?: string }>({})
// const setSearchParams = (params: any) => {
//   // currentPage.value = 1
//   // searchParams.value = params
//   // 筛选dataList
//   if (Object.keys(params).length > 0) {
//     const currentData = dataList.value.filter(
//       (v) => v.name.includes(params.name) || v.code.includes(params.code)
//     )
//     dataList.value = currentData
//   } else {
//     getList()
//   }
// }

const currentDicKey = ref<string>('')
const tableColumns = ref<TableColumn[]>([
  {
    field: 'selection',
    type: 'selection'
  },

  {
    label: '名称',
    field: 'name'
  },
  {
    label: '编码',
    field: 'code'
  },
  {
    label: '排序',
    field: 'sort'
  },
  {
    label: '描述',
    field: 'description'
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
    label: '操作',
    field: 'action',
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row as DictionaryEntry
        return (
          <>
            <BaseButton type="primary" onClick={() => action(row, 'edit')}>
              {t('exampleDemo.edit')}
            </BaseButton>
            <BaseButton type="success" onClick={() => action(row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton type="danger" onClick={() => delData(row)}>
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

const currentRow = ref<DictionaryEntry>()
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = {
    name: '',
    dictionaryId: currentNodeKey.value,
    code: '',
    sort: 0,
    status: true
  }
  dialogVisible.value = true
  actionType.value = ''
}

const currentNodeKey = ref<number>()
const currentChange = (id: number) => {
  currentNodeKey.value = Number(id)
  getList()
}

const delLoading = ref(false)
const ids = ref<string[]>([])

const delData = async (row?: DictionaryEntry) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.id]
    : elTableExpose?.getSelectionRows().map((v: DictionaryEntry) => v.id) || []
  if (ids.value.length === 0) {
    ElMessage.error('请先选择要删除的数据')
    return
  }
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
    getList()
  })
}

const action = async (row: DictionaryEntry, type: string) => {
  currentRow.value = row
  const isEdit = type === 'edit'
  dialogTitle.value = t(isEdit ? 'exampleDemo.edit' : 'exampleDemo.detail')
  isEdit && (currentRow.value.dictionaryId = currentNodeKey.value)
  actionType.value = type
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

// const searchSchema = ref<FormSchema[]>([
//   {
//     field: 'name',
//     label: '名称',
//     component: 'Input'
//   },
//   {
//     field: 'code',
//     label: '编码',
//     component: 'Input'
//   }
// ])

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  // const isEdit = actionType.value === 'edit' //  判断是修改还是新增
  if (formData) {
    try {
      //  提交 新增 或者 修改
      saveLoading.value = true
      await dictionaryStore.upsertDicEntry(formData as DictionaryEntry)
      dialogVisible.value = false
      ElMessage.success('更新成功!')
      currentPage.value = 1
      getList()
    } catch (error) {
      console.log('🚀 ~ xzz: save -> error', error)
    } finally {
      saveLoading.value = false
    }
  }
}

onMounted(async () => {
  allDictionaryList.value.length > 0 && currentChange(allDictionaryList.value[0].id as number)
})
const { copy } = useClipboard()
</script>

<template>
  <div class="flex w-100% h-100%">
    <TypeWrite @currentChange="currentChange" />
    <ContentWrap class="flex-[3] ml-20px">
      <!-- <Search @reset="getList" @search="setSearchParams" :schema="searchSchema" /> -->

      <Seed />
      <ElLink class="mx-10px" @click="copy(currentDicKey)" type="primary">
        {{ currentDicKey && `当前字典: ${currentDicKey}` }}</ElLink
      >
      <div class="my-10px">
        <BaseButton type="primary" @click="AddAction" :disabled="!currentNodeKey">{{
          t('exampleDemo.add')
        }}</BaseButton>
        <BaseButton
          :loading="delLoading"
          type="danger"
          @click="delData()"
          :disabled="!currentNodeKey"
        >
          {{ t('exampleDemo.batchDel') }}
        </BaseButton>
      </div>
      <Table
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :columns="tableColumns"
        :data="dataList"
        :loading="loading"
        @register="tableRegister"
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
