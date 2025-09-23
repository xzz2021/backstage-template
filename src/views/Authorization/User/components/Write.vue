<script setup lang="tsx">
import { DepartmentUserItem } from '@/api/department/types'
import { resetPasswordApi } from '@/api/user'
import { BaseButton } from '@/components/Button'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useI18n } from '@/hooks/web/useI18n'
import { useValidator } from '@/hooks/web/useValidator'
import { useDepartmentStore } from '@/store/modules/department'
import { useRoleStore } from '@/store/modules/role'
import { ElInput, ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { PropType, reactive, ref, unref, watch } from 'vue'

const roleStore = useRoleStore()
const { roleList } = storeToRefs(roleStore) // 使用storeToRefs获取store中的数据
const { required, phone } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<DepartmentUserItem>,
    default: () => undefined
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    console.log('🚀 ~ xzz: formData', JSON.parse(JSON.stringify(formData)))
    // const { departments, roles } = formData
    // delete formData.roles
    // formData.departments = departments.map((item) => item.id || item)
    // formData.roles = roles.map((item) => item.id || item)
    return formData
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    // deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})

const departmentStore = useDepartmentStore()
const { departmentList } = storeToRefs(departmentStore)
// const selectList = ref<any[]>([])
// const departmentOption = ref<any[]>([])
// onMounted(async () => {
//   roleList.value.length == 0 && (await roleStore.getRoleList())
//   // selectList.value = unref(roleList)
//   // departmentOption.value = unref(departmentList)
// })
const { t } = useI18n()

const rules = reactive({
  username: [required(), { min: 2, max: 16, message: '用户名称长度需要2-16位' }],
  phone: [required(), phone()]
})

const getResetTime = ref(99)
const resetPwding = ref(false)
const newPwd = ref('')
const resetPwd = async () => {
  resetPwding.value = true
  const timer = setInterval(() => {
    getResetTime.value--
    if (getResetTime.value <= 0) {
      clearInterval(timer)
      getResetTime.value = 60
      resetPwding.value = false
    }
  }, 1000)
  //  发起后端请求
  try {
    if (props.currentRow) {
      const { id } = props.currentRow
      const res = await resetPasswordApi({ id, password: newPwd.value.trim() || '123456' })
      const idx = res?.data?.id
      if (idx) {
        return ElMessage.success('重置成功!')
      }
    }
    return ElMessage.error('重置失败!')
  } catch (error) {
    console.log('🚀 ~ xzz: resetPwd -> error', error)
  }
}
const formSchema = ref<FormSchema[]>([
  {
    field: 'username',
    label: t('userDemo.username'),
    component: 'Input'
  },
  {
    field: 'phone',
    label: t('login.phone'),
    component: 'Input'
  },
  {
    field: 'departments',
    label: t('userDemo.department'),
    component: 'TreeSelect',
    componentProps: {
      nodeKey: 'id',
      props: {
        label: 'name',
        value: 'id'
      },
      defaultExpandAll: true,
      highlightCurrent: true,
      expandOnClickNode: false,
      checkStrictly: true, // 自动勾选父节点
      multiple: true, // 允许多选
      checkOnClickNode: true,
      clearable: true,
      showCheckbox: true
      // on: {
      //   change: (val: string) => {
      //     setValues({ departmentId: val })
      //   }
      // }
    },
    optionApi: async () => {
      return departmentList
    }
  },
  {
    field: 'roles',
    label: t('userDemo.role'),
    component: 'Select',
    componentProps: {
      multiple: true,
      collapseTags: true,
      maxCollapseTags: 1,
      props: {
        label: 'name',
        value: 'id'
      }
    },
    optionApi: () => {
      // 此处不可以使用store数据，因为store数据是响应式的，会导致表单数据不更新, 循环卡死
      return roleList
    }
  },
  {
    field: 'status',
    label: t('userDemo.status'),
    component: 'Switch',
    value: true,
    componentProps: {
      activeText: t('userDemo.enable'),
      inactiveText: t('userDemo.disable'),
      inlinePrompt: true
    }
  },
  {
    field: 'resetPwd',
    // label: '重置密码',
    colProps: {
      span: 16
    },
    formItemProps: {
      slots: {
        default: (_data) => {
          // if (!data?.id) return null
          return (
            <div class="w-[100%] flex mt-50">
              <ElInput v-model={newPwd.value} placeholder="请输入重置密码,默认为123456" />
              <BaseButton
                type="primary"
                disabled={unref(resetPwding)}
                class="ml-10px"
                onClick={resetPwd}
              >
                重置密码
                {unref(resetPwding) ? `(${unref(getResetTime)})` : ''}
              </BaseButton>
            </div>
          )
        }
      }
    }
  }
])
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
