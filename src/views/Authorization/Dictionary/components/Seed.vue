<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { ElInput, ElMessage } from 'element-plus'
import { useDictionaryStore } from '@/store/modules/dictionary'
import { exportSeedData } from '@/utils/file'

const dictionaryStore = useDictionaryStore()
const seedData = ref('')

const seedDialog = ref(false)
const generateSeed = async () => {
  if (!seedData.value) {
    ElMessage.error('请输入seed数据')
    return
  }
  await dictionaryStore.generateDictionarySeed(JSON.parse(seedData.value))

  ElMessage.success('生成成功')
  // 更新列表
  seedDialog.value = false
  await dictionaryStore.updateDictionaryList()
  seedData.value = ''
}

const exportSeed = async () => {
  console.log('exportSeed')
  // 获取所有字典数据
  const dicList = await dictionaryStore.getAllDictionaryList
  // 将字典数据转换为seed格式
  const seedList = dicList.map((v) => {
    return {
      name: v.name,
      code: v.code,
      sort: v.sort,
      entries: v.entries
        ? v.entries.map((entry) => {
            return {
              name: entry.name,
              code: entry.code,
              sort: entry.sort
            }
          })
        : undefined
    }
  })
  // 将seed数据 以json格式化号之后的内容   写入到文件中
  exportSeedData(seedList, 'dictionary')
}
</script>
<template>
  <BaseButton type="primary" @click="exportSeed">一键导出seed</BaseButton>
  <BaseButton type="danger" @click="seedDialog = true">增量生成seed</BaseButton>
  <Dialog v-model="seedDialog" title="生成新数据">
    <div class="text-[red] m-[10px]">请将seed数据粘贴到下方(必须是数组): </div>
    <ElInput v-model="seedData" type="textarea" :rows="16" />
    <template #footer>
      <BaseButton @click="seedDialog = false">取消</BaseButton>
      <BaseButton @click="generateSeed" type="primary">确定</BaseButton>
    </template>
  </Dialog>
</template>
