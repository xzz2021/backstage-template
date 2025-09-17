<script setup lang="tsx">
import { ElUpload, UploadFile, ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { uploadFileOssApi } from '@/api/oss'

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
  await uploadFileOssApi(fileInfo)
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
