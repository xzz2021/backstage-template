<script setup lang="ts">
import { addPermission, updatePermission } from '@/api/menu'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { useMenuStore } from '@/store/modules/menu'
import { ElDrawer, ElMessage } from 'element-plus'
import { reactive, watch } from 'vue'

const menuStore = useMenuStore()
const modelValue = defineModel<boolean>()
const { required } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '权限名称',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'code',
    label: '权限标识',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'value',
    label: '值',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const emit = defineEmits(['refresh'])

const rules = reactive({
  name: [required()],
  code: [required()]
})

const confirm = async () => {
  const elFormExpose = await getElFormExpose()
  if (!elFormExpose) return
  const valid = await elFormExpose?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    const isEdit = !!formData.id
    isEdit
      ? await updatePermission(formData).finally(() => {
          modelValue.value = false
        })
      : await addPermission(formData).finally(() => {
          modelValue.value = false
        })

    ElMessage.success(isEdit ? '更新权限成功' : '添加权限成功')
    emit('refresh')
  }
}

const onClose = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.resetFields()
}

watch(
  () => menuStore.drawerFormData,
  async (value) => {
    if (!value) return
    formMethods.setValues(value)
  },
  {
    deep: true
    // immediate: true
  }
)
</script>

<template>
  <ElDrawer v-model="modelValue" title="自定义权限" append-to-body @close="onClose">
    <template #default>
      <Form :rules="rules" @register="formRegister" :schema="formSchema" />
    </template>
    <template #footer>
      <div>
        <BaseButton @click="() => (modelValue = false)">取消</BaseButton>
        <BaseButton type="primary" @click="confirm">确认</BaseButton>
      </div>
    </template>
  </ElDrawer>
</template>
