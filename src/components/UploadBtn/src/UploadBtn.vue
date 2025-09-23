<script setup lang="tsx">
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'
import { ElLoading, ElMessage, ElUpload, UploadFile } from 'element-plus'

const { t } = useI18n()

const props = defineProps<{
  uploadApi?: (file: File) => Promise<void>
}>()

const uploadChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  // console.log('xzz2021: uploadChange -> uploadFile', uploadFile)
  // return
  //  计算文件的sha256
  // const sha256 = await getFileSha256(uploadFile.raw)

  // const fileInfo = {
  //   // sha256,
  //   file: uploadFile.raw
  // }

  // // 1. 上传文件

  // await uploadFileApi(fileInfo)
  ElLoading.service({
    target: document.body,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  await props.uploadApi?.(uploadFile.raw).finally(() => {
    ElLoading.service().close()
  })
  ElMessage.success('上传成功')
  // emit('success')
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
        <div>{{ t('formDemo.upload') }}</div>
      </div>
    </BaseButton>
  </el-upload>
</template>
