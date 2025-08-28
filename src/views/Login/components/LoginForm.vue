<script setup lang="tsx">
import { reactive, ref, onMounted, unref } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { ElCheckbox, ElLink } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { Icon } from '@/components/Icon'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { UserType } from '@/api/login/types'
import { loginApi } from '@/api/login'
import { useLogin } from './hooks'

const { required } = useValidator()
const { successLogin } = useLogin()

const emit = defineEmits(['to-register', 'to-wechat', 'to-sms'])

const userStore = useUserStore()

const { t } = useI18n()

const rules = {
  // username: [required()],
  phone: [required()],
  password: [required()]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">{t('login.login')}</h2>
        }
      }
    }
  },
  {
    field: 'phone',
    label: t('login.phone'),
    value: '13077908822',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: '112233',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      // 按下enter键触发登录
      onKeydown: (_e: any) => {
        if (_e.key === 'Enter') {
          signIn()
        }
      }
    }
  },
  {
    field: 'tool',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="flex justify-between items-center w-[100%]">
                <ElCheckbox v-model={remember.value} label={t('login.remember')} size="small" />
                <ElLink type="primary" underline={false}>
                  {t('login.forgetPassword')}
                </ElLink>
              </div>
            </>
          )
        }
      }
    }
  },
  {
    field: 'login',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  loading={loading.value}
                  type="primary"
                  class="w-[100%]"
                  onClick={signIn}
                >
                  {t('login.login')}
                </BaseButton>
              </div>
              <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toRegister}>
                  {t('login.register')}
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  },
  {
    field: 'other',
    component: 'Divider',
    label: t('login.otherLogin'),
    componentProps: {
      contentPosition: 'center'
    }
  },
  {
    field: 'otherIcon',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="flex justify-between w-[100%]">
                <div onClick={toSms}>
                  <Icon
                    icon="vi-ant-design:message-outlined"
                    size={iconSize}
                    class="cursor-pointer ant-icon"
                    color={iconColor}
                    hoverColor={hoverColor}
                  />
                </div>
                <div onClick={toWechat}>
                  <Icon
                    icon="vi-ant-design:wechat-filled"
                    size={iconSize}
                    class="cursor-pointer ant-icon"
                    color={iconColor}
                    hoverColor={hoverColor}
                  />
                </div>
                <div>
                  <Icon
                    icon="vi-ant-design:alipay-circle-filled"
                    size={iconSize}
                    color={iconColor}
                    hoverColor={hoverColor}
                    class="cursor-pointer ant-icon"
                  />
                </div>
                <div>
                  <Icon
                    icon="vi-ant-design:weibo-circle-filled"
                    size={iconSize}
                    color={iconColor}
                    hoverColor={hoverColor}
                    class="cursor-pointer ant-icon"
                  />
                </div>
              </div>
            </>
          )
        }
      }
    }
  }
])

const iconSize = 30

const remember = ref(userStore.getRememberMe)

const initLoginInfo = () => {
  const loginInfo = userStore.getLoginInfo
  if (loginInfo) {
    const { phone } = loginInfo
    setValues({ phone })
  }
}
onMounted(() => {
  initLoginInfo()
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues } = formMethods

const loading = ref(false)

const iconColor = '#999'

const hoverColor = 'var(--el-color-primary)'

// 去注册页面
const toRegister = () => {
  emit('to-register')
}

const toWechat = () => {
  emit('to-wechat')
}

const toSms = () => {
  emit('to-sms')
}

const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<UserType>()

      try {
        const res = await loginApi(formData)
        if (res.code === 200) {
          const { userinfo, access_token } = res.data
          // 是否记住我
          if (unref(remember)) {
            userStore.setLoginInfo({
              phone: formData.phone,
              username: formData.username
              // password: formData.password
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setRememberMe(unref(remember))
          await successLogin(userinfo, access_token)
        }
      } catch (error) {
        console.log('xzz2021: signIn -> error', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
