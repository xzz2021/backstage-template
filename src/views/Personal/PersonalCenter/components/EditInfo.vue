<script lang="ts" setup>
import { updatePersonApi } from '@/api/user'
import { BaseButton } from '@/components/Button'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useI18n } from '@/hooks/web/useI18n'
import { useValidator } from '@/hooks/web/useValidator'
import { ElDivider, ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref, watch } from 'vue'

const { t } = useI18n()

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['refresh'])
const { required, phone, maxlength } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'username',
    label: t('userDemo.username'),
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'phone',
    label: t('login.phone'),
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'email',
    label: t('userDemo.email'),
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

// const rules = reactive({
//   realName: [required(), maxlength(50)],
//   phoneNumber: [phone()],
//   email: [email()]
// })

const rules = reactive({
  username: [required(), maxlength(50)],
  phone: [phone()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

watch(
  () => props.userInfo,
  (value) => {
    const { id, username, phone, email } = value
    setValues({ id, username, phone, email })
  },
  {
    immediate: true,
    deep: true
  }
)

const saveLoading = ref(false)
const save = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    ElMessageBox.confirm('是否确认修改?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          saveLoading.value = true
          // 这里可以调用修改用户信息接口
          const formData = await getFormData()
          await updatePersonApi(formData)
          emit('refresh')
          ElMessage.success('修改成功')
        } catch (error) {
          console.log(error)
        } finally {
          saveLoading.value = false
        }
      })
      .catch(() => {})
  }
}
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <ElDivider />
  <BaseButton type="primary" @click="save">{{ t('exampleDemo.save') }}</BaseButton>
</template>
