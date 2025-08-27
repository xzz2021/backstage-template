<script setup lang="tsx">
import { PropType, ref } from 'vue'

defineProps({
  currentData: {
    type: Object as PropType<any>,
    default: () => undefined
  }
})

const currentTreeData = ref<any>({
  meta: {
    checkAll: false,
    isIndeterminate: false
  },
  permissionList: [],
  permissions: []
})

const handleCheckAllChange = (val: boolean) => {
  console.log('全选切换:', val)
}

const handleCheckChange = (val: any[]) => {
  console.log('选中权限:', val)
}
</script>

<template>
  <div class="flex-1">
    <div v-if="currentTreeData && currentTreeData.permissionList" class="flex gap-4">
      <ElCheckbox
        v-model="currentTreeData.meta.checkAll"
        :indeterminate="currentTreeData.meta?.isIndeterminate"
        @change="handleCheckAllChange"
        :style="{ display: currentTreeData.permissionList.length > 1 ? 'block' : 'none' }"
      >
        全选
      </ElCheckbox>

      <ElCheckboxGroup v-model="currentTreeData.permissions" @change="handleCheckChange">
        <ElCheckbox
          v-for="v in currentTreeData.permissionList"
          :key="v.code"
          :label="v.name"
          :value="v.code"
        />
      </ElCheckboxGroup>
    </div>
  </div>
</template>
