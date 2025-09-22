<script setup lang="ts">
import { uploadAvatarApi } from '@/api/user'
import { ImageCropping } from '@/components/ImageCropping'
import { ElMessage } from 'element-plus'
import { ref, unref } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: ''
  },
  userId: {
    type: Number,
    default: 0
  }
})

const fileUrl = ref('')

const CropperRef = ref<ComponentRef<typeof ImageCropping>>()

const getAvatarUrl = async () => {
  // 获取头像数据
  const filename =
    unref(CropperRef)?.getFileName() || props?.url.split('/').pop() + Date.now().toString()

  const blob = await new Promise((resolve) => {
    unref(CropperRef)
      ?.cropperExpose?.getCroppedCanvas()
      ?.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            resolve(null)
          }
        },
        'image/jpeg',
        0.8
      )
  })

  try {
    const formData = new FormData()
    formData.append('file', blob as Blob, filename)
    formData.append('id', props.userId.toString())
    const res = await uploadAvatarApi(formData)

    // 上传成功 更新用户头像
    ElMessage.success('头像更换成功')
    return res?.data?.url
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  getAvatarUrl
})
</script>

<template>
  <div>
    <ImageCropping ref="CropperRef" :image-url="fileUrl || url" />
  </div>
</template>
