<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { BaseButton } from '@/components/Button'
import { FormSchema } from '@/components/Form'
import { Table, TableColumn } from '@/components/Table'
import { useOssStore } from '@/store/modules/oss'
import { OssListItem } from '@/api/oss/types'
import { formatFileSize, getFileIcon2 } from '@/utils/file'
import { formatToDateTime } from '@/utils/dateUtil'
import { Icon } from '@/components/Icon'

import {
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPopover,
  ElButton,
  ElMessageBox
} from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { createFolderApi, deleteObjectApi, searchOssApi } from '@/api/oss'
import UploadBtn from './components/UploadBtn.vue'
import S3UploadBtn from './components/S3UploadBtn.vue'
import { downloadFile } from './components/utils'

const { getOssList } = useOssStore()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const params = {
      ...unref(searchParams)
    }
    return await getOssList(params)
  }
})
const { loading, dataList, total } = tableState
const { getList } = tableMethods

const isSearching = ref(false)
const currentPrefix = ref('')
const searchParams = ref<any>(null)
const setSearchParams = (params: any) => {
  // console.log('xzz2021: setSearchParams -> params', params)
  // 如果params为空
  searchParams.value = params
  currentPrefix.value = params?.prefix || ''
  getList()
}

const searchFile = async (params: { name: string }) => {
  isSearching.value = true
  currentPrefix.value = ''
  const res = await searchOssApi({ searchTerm: params.name })
  const list = res?.data?.list || []
  dataList.value = list
  total.value = list.length
}

const dialogVisible = ref(false)

const currentRow = ref<OssListItem | null>(null)
const actionType = ref('')

const deleteFile = (rawName: string) => {
  ElMessageBox.confirm('确定删除该文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteObjectApi({
      objectName: rawName
    })
    ElMessage.success('删除成功')
    getList()
  })
}

const resetSearch = () => {
  isSearching.value = false
  searchParams.value = null
  currentPrefix.value = ''
  getList()
}

const popoverDom = (displayName: string, rawName: string) => {
  const newName = displayName.replace(currentPrefix.value, '')
  return (
    <ElPopover
      ref="popover"
      trigger="contextmenu"
      width="auto"
      v-slots={{
        default: () => (
          <>
            <ElButton
              type="primary"
              plain
              onClick={() => {
                downloadFile(rawName, rawName.endsWith('/'))
              }}
            >
              下载
            </ElButton>
            <ElButton
              type="danger"
              plain
              onClick={() => {
                deleteFile(rawName)
              }}
            >
              删除
            </ElButton>
          </>
        ),
        reference: () => <div class="">{newName}</div>
      }}
    />
  )
}

const generateDom = (data: any) => {
  const rawName = data?.name || data?.prefix
  const ll = data?.prefix?.split('/')
  const name = data?.name || ll?.[ll?.length - 2]
  const isFolder = data?.prefix
  const icon = isFolder ? 'flat-color-icons:folder' : getFileIcon2(name.split('.').pop())
  return (
    <>
      {isFolder ? (
        <div
          class="flex items-center gap-10px cursor-pointer"
          onClick={() => {
            setSearchParams({ prefix: data.prefix || '' })
          }}
        >
          <Icon icon={icon}></Icon>
          {/* <div class="truncate">{name}</div> */}
          {popoverDom(name, rawName)}
        </div>
      ) : (
        <div class="flex items-center gap-10px cursor-pointer">
          <Icon icon={icon}></Icon>
          {popoverDom(name, rawName)}
        </div>
      )}
    </>
  )
}

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'selection',
    type: 'selection'
  },
  {
    field: 'name',
    label: '名称',
    slots: {
      default: (data: any) => {
        return generateDom(data.row)
      }
    }
  },
  {
    field: 'size',
    label: '大小',
    width: '100px',
    slots: {
      default: (data: any) => {
        return <>{data.row.prefix ? '-' : formatFileSize(data.row.size)}</>
      }
    }
  },
  {
    field: 'lastModified',
    label: '创建时间',
    width: '200px',
    slots: {
      default: (data: any) => {
        return <>{data.row.prefix ? '-' : formatToDateTime(data.row.lastModified)}</>
      }
    }
  }
])

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '名称',
    component: 'Input'
  }
  // {
  //   field: 'status',
  //   label: '状态',
  //   component: 'Select',
  //   componentProps: {
  //     options: [
  //       { label: '启用', value: true },
  //       { label: '禁用', value: false }
  //     ]
  //   }
  // }
])

const AddFolder = () => {
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = 'createFolder'
}

const formData = ref({
  folderName: ''
})

const rules = ref({
  folderName: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }]
})

const handleConfirm = () => {
  const newData = {
    folderName: formData.value.folderName,
    parentPath: currentPrefix.value.replace(/\/$/, '')
  }
  createFolderApi(newData).then((res) => {
    if (res.code === 200) {
      ElMessage.success('创建文件夹成功')
      dialogVisible.value = false
      formData.value.folderName = ''
      getList()
    }
  })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="searchFile" @reset="resetSearch" />

    <div class="mb-10px flex items-center justify-between">
      <div class="flex items-center gap-10px">
        <div class="text-14px">当前目录: </div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item class="cursor-pointer" @click="setSearchParams({ prefix: '' })">
            <div class="hover:bg-gray-100 rounded-md px-5px py-4px"> 根目录 </div>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="item in currentPrefix.split('/')"
            :key="item"
            class="cursor-pointer"
            @click="setSearchParams({ prefix: currentPrefix.split(item).shift() + item + '/' })"
          >
            <div class="hover:bg-gray-100 rounded-md px-5px py-4px max-w-80px truncate">
              {{ item }}
            </div>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="flex items-center gap-10px">
        <UploadBtn @success="getList" :folderPath="currentPrefix" />
        <S3UploadBtn @success="getList" :folderPath="currentPrefix" />
        <BaseButton plain @click="AddFolder">创建文件夹</BaseButton>
      </div>
    </div>

    <Table
      :columns="tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total,
        layout: 'total'
      }"
      :headerCellStyle="() => ({ backgroundColor: '#fafafa' })"
      :border="false"
      @register="tableRegister"
    />

    <Dialog
      title="创建文件夹"
      v-model="dialogVisible"
      @confirm="handleConfirm"
      width="600px"
      maxHeight="200px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef">
        <el-form-item label="文件夹名称" prop="folderName">
          <el-input v-model="formData.folderName" />
        </el-form-item>
      </el-form>
      <template #footer>
        <BaseButton type="primary" @click="dialogVisible = false">取消</BaseButton>
        <BaseButton type="primary" @click="handleConfirm">确定</BaseButton>
      </template>
    </Dialog>
  </ContentWrap>
</template>
