<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { ElInput, ElMessage } from 'element-plus'
import { useDepartmentStore } from '@/store/modules/department'
import { storeToRefs } from 'pinia'
import { exportSeedData } from '@/utils/file'
const departmentStore = useDepartmentStore()

const { departmentList } = storeToRefs(departmentStore)

const seedData = ref('')
const emit = defineEmits(['getList'])
const seedDialog = ref(false)
const generateSeed = async () => {
  if (!seedData.value) {
    ElMessage.error('请输入seed数据')
    return
  }
  const res = await departmentStore.generateSeed(JSON.parse(seedData.value))
  if (res) {
    ElMessage.success('生成成功')
    // 更新列表
    seedDialog.value = false
    emit('getList')
    seedData.value = ''
  } else {
    ElMessage.error('生成失败')
  }
}
/*
const processChildrenData = (list: DepartmentItem[]) => {
  return list.map((item) => {
    const { name, status, remark, parentId, children } = item
    return {
      name,
      status,
      remark,
      parentId,
      ...(children?.length && { children: processChildrenData(children) })
    }
  })
}
const exportSeed = async () => {
  // 将seed数据 以json格式化号之后的内容   写入到文件中
  exportSeedData(unref(departmentList.value), 'department')
}

*/
</script>
<template>
  <BaseButton type="primary" @click="() => exportSeedData(departmentList, 'department')"
    >一键导出seed</BaseButton
  >
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
