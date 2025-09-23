<script setup lang="tsx">
import { deleteFileApi, getFileListApi, uploadFileApi } from '@/api/file'
import type { FileItem } from '@/api/file/types'
import { BaseButton } from '@/components/Button'
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { UploadBtn } from '@/components/UploadBtn'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { downloadFile, formatFileSize } from '@/utils/file'
import { useClipboard } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { reactive, ref, unref } from 'vue'
import RenderFile from './components/RenderFile.vue'

const { copy } = useClipboard()

const ids = ref<number[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const params = {
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    }
    const res = await getFileListApi(params)
    const { list, total } = res.data
    return { list, total }
  },

  fetchDelApi: async () => {
    const res = await deleteFileApi(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref<any>({})
// const setSearchParams = (params: any) => {
//   const { dateRange, ...rest } = params
//   searchParams.value = { ...rest }
//   //   if (dateRange) {
//   //     // 因为是get请求，所以需要将日期格式化成json字符串
//   //     searchParams.value.dateRange = JSON.stringify([
//   //       dateRange[0].toISOString(),
//   //       dateRange[1].toISOString()
//   //     ])
//   //   }
//   getList()
// }

const { t } = useI18n()

const tableColumns = reactive<TableColumn[]>([
  { field: 'select', type: 'selection' },
  {
    field: 'index',
    label: t('userDemo.index'),
    type: 'index'
  },
  {
    field: 'name',
    label: '文件预览',
    width: 170,
    slots: {
      default: (data: any) => {
        const { url, extension, name } = data.row
        return <RenderFile url={url} extension={extension} filename={name} />
      }
    }
  },

  {
    field: 'size',
    label: '文件大小',
    formatter: (row: any) => formatFileSize(row.size)
  },
  {
    field: 'mimeType',
    label: '文件类型'
  },
  {
    field: 'createdAt',
    label: '上传时间'
  },
  {
    field: 'action',
    label: t('userDemo.action'),
    width: 300,
    fixed: 'right',
    slots: {
      default: (data: any) => {
        const row = data.row
        return (
          <>
            <BaseButton type="success" onClick={() => copyUrl(row.url)}>
              {t('setting.copy')}
            </BaseButton>
            <BaseButton
              type="primary"
              onClick={() => downloadFile({ url: row.url, fileName: row.name })}
            >
              {t('formDemo.download')}
            </BaseButton>
            <BaseButton type="danger" onClick={() => delData(row.id)}>
              {t('exampleDemo.del')}
            </BaseButton>
          </>
        )
      }
    }
  }
])

const delLoading = ref(false)

const delData = async (id?: number) => {
  if (id) {
    ids.value = [id]
  } else {
    const elTableExpose = await getElTableExpose()
    ids.value = elTableExpose?.getSelectionRows().map((v: FileItem) => v.id) || []
  }
  if (ids.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

// const searchSchema = reactive<FormSchema[]>([
//   {
//     field: 'username',
//     label: '操作人',
//     component: 'Input'
//   },
//   {
//     field: 'url',
//     label: '操作路径',
//     component: 'Input'
//   }
// ])

const copyUrl = (url: string) => {
  copy(url)
  ElMessage.success('文件链接复制成功')
}

const startUpload = async (file: File) => {
  const fileInfo = {
    // sha256,
    file
  }
  // 1. 上传文件
  await uploadFileApi(fileInfo)
  await getList()
  ElMessage.success('上传成功')
}
</script>

<template>
  <ContentWrap>
    <!-- <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" /> -->

    <div class="mb-10px flex items-center gap-10px">
      <UploadBtn :uploadApi="startUpload" />
      <BaseButton :loading="delLoading" type="danger" @click="delData">
        {{ t('exampleDemo.batchDel') }}
      </BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      align="center"
      headerAlign="center"
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
