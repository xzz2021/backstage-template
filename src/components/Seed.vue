<script setup lang="ts">
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { exportSeedData } from '@/utils/file'
import { ElInput, ElMessage } from 'element-plus'
import { PropType, ref } from 'vue'
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
  await new Promise((resolve) => setTimeout(resolve, 2000))
  // ElMessage.success('生成成功')
  // 更新列表
  seedDialog.value = false
  emit('getList')
  seedData.value = ''
}
</script>
<template>
  <Permission permission="seed">
    <BaseButton type="primary" @click="() => exportSeedData(keyData.treeList, keyData.filename)">
      一键复制seed
    </BaseButton>
    <BaseButton
      type="success"
      @click="() => exportSeedData(keyData.treeList, keyData.filename, true)"
    >
      下载seed文件
    </BaseButton>
    <BaseButton type="danger" @click="seedDialog = true">增量更新seed</BaseButton>
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
