<script setup lang="ts">
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { exportSeedData } from '@/utils/file'
import { ElButtonGroup, ElInput, ElMessage } from 'element-plus'
import { nextTick, PropType, ref } from 'vue'
const seedData = ref('')
const emit = defineEmits(['getList', 'generateSeed'])
defineProps({
  keyData: {
    type: Object as PropType<{
      treeList: any[]
      filename: string
    }>,
    default: () => ({
      treeList: [],
      filename: '导出的文件名称'
    })
  }
})
const seedDialog = ref(false)
const generateSeed = async () => {
  if (!seedData.value) {
    ElMessage.error('请输入seed数据')
    return
  }
  await emit('generateSeed', JSON.parse(seedData.value))

  // 等待下一个tick，确保父组件的异步操作有机会开始
  await nextTick()
  // ElMessage.success('生成成功')
  // 更新列表
  seedDialog.value = false
  emit('getList')
  seedData.value = ''
}
</script>
<template>
  <Permission permission="seed">
    <ElButtonGroup class="ml-10px">
      <BaseButton type="primary" @click="() => exportSeedData(keyData.treeList, keyData.filename)">
        复制seed
      </BaseButton>
      <BaseButton
        type="success"
        @click="() => exportSeedData(keyData.treeList, keyData.filename, true)"
      >
        下载seed
      </BaseButton>
      <BaseButton type="danger" @click="seedDialog = true">更新seed</BaseButton>
    </ElButtonGroup>
  </Permission>
  <Dialog v-model="seedDialog" title="生成新数据">
    <div class="text-[red] m-[10px]">请将seed数据粘贴到下方(必须是数组): </div>
    <ElInput v-model="seedData" type="textarea" :rows="16" />
    <template #footer>
      <BaseButton @click="seedDialog = false">取消</BaseButton>
      <BaseButton @click="generateSeed" type="primary">确定</BaseButton>
    </template>
  </Dialog>
</template>
