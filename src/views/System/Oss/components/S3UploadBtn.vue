<script setup lang="tsx">
import { ElUpload, UploadFile, ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { ChunkUploader } from '@/utils/chunk'

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
  const chunkUploader = new ChunkUploader(uploadFile.raw, {
    bucket: 'public', // 选择 存储桶
    key: fileInfo.folderPath, // 慎重传递  目录
    apiBase: '/api',
    partSize: 1024 * 1024 * 6,
    onProgress: ({ uploadedBytes, totalBytes, rateBps, uploadedParts, totalParts }) => {
      const textContent =
        `已传 ${(uploadedBytes / 1e6).toFixed(1)}MB / ${(totalBytes / 1e6).toFixed(1)}MB ` +
        `｜分片 ${uploadedParts}/${totalParts} ` +
        (rateBps ? `｜速度 ${(rateBps / 1e6).toFixed(2)} MB/s` : '')
      console.log(textContent)
    },
    onPart: (part) => {
      console.log(part)
    }
  })
  try {
    await chunkUploader.uploadAll() // 自动初始化/续传/合并
    // alert(`上传完成：${result.data.key} ${result.data.size} bytes`)
    ElMessage.success('上传成功')
    emit('success')
  } catch (err) {
    console.error(err)
    alert('上传失败或已取消')
  }
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
        <div>大文件分片上传</div>
      </div>
    </BaseButton>
  </el-upload>
</template>
