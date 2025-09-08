<script setup lang="tsx">
import { ElUpload, UploadFile, ElMessage } from 'element-plus'

// import { getFileSha256 } from '@/utils/file'
import { Icon } from '@/components/Icon'

import { uploadFileApi } from '@/api/file'

const emit = defineEmits(['success'])
// const props = defineProps<{
//   success: () => void
// }>()
const uploadChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  // console.log('xzz2021: uploadChange -> uploadFile', uploadFile)
  // return
  //  计算文件的sha256
  // const sha256 = await getFileSha256(uploadFile.raw)

  const fileInfo = {
    // sha256,
    file: uploadFile.raw
  }

  // 1. 上传文件

  await uploadFileApi(fileInfo)

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
    <!-- <el-button type="primary">
      文件上传<el-icon class="el-icon--right"><Upload /></el-icon>
    </el-button> -->
    <BaseButton type="primary">
      <div class="flex items-center gap-4px">
        <Icon icon="vi-tdesign:cloud-upload" />
        <div>文件上传</div>
      </div>
    </BaseButton>
  </el-upload>
</template>
