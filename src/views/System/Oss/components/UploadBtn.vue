<script setup lang="tsx">
import { uploadFileOssApi } from '@/api/oss'
import { Icon } from '@/components/Icon'
import { ElLoading, ElMessage, ElUpload, UploadFile } from 'element-plus'

const props = defineProps<{
  folderPath?: string
}>()
const emit = defineEmits(['success'])

const uploadChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return

  const fileInfo = {
    folderPath: props?.folderPath,
    file: uploadFile.raw
  }

  // 1. 上传文件
  // 开启全局loading
  ElLoading.service({
    target: document.body,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  await uploadFileOssApi(fileInfo).finally(() => {
    ElLoading.service().close()
  })

  ElMessage.success('上传成功')
  emit('success')
}
</script>

<template>
  <el-upload
    class="upload-demo"
    :auto-upload="false"
    :show-file-list="false"
    :on-change="uploadChange"
  >
    <BaseButton type="primary">
      <div class="flex items-center gap-4px">
        <Icon icon="vi-tdesign:cloud-upload" />
        <div>文件上传</div>
      </div>
    </BaseButton>
  </el-upload>
</template>
