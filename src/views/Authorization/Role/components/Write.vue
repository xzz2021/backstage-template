<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTree, ElCheckboxGroup, ElCheckbox } from 'element-plus'
import { eachTree } from '@/utils/tree'
import { findIndex } from '@/utils'
import { useMenuStore } from '@/store/modules/menu'
import { storeToRefs } from 'pinia'

const { t } = useI18n()

const { required } = useValidator()
const menuStore = useMenuStore()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const treeRef = ref<typeof ElTree>()

const formSchema = ref<FormSchema[]>([
  {
    field: 'name',
    label: t('role.roleName'),
    component: 'Input'
  },
  {
    field: 'code',
    label: t('role.roleCode'),
    component: 'Input'
  },
  {
    field: 'status',
    label: t('menu.status'),
    component: 'Switch',
    componentProps: {
      inlinePrompt: true,
      activeText: t('userDemo.enable'),
      inactiveText: t('userDemo.disable')
    }
  },
  {
    field: 'remark',
    label: t('userDemo.remark'),
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 5
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'menu',
    label: t('role.menu'),
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="flex w-full">
                <div class="flex-1">
                  <ElCheckbox
                    modelValue={unref(checkAllTreeData)}
                    label="全选"
                    onChange={handleCheckAllTreeChange}
                    class="mx-2"
                  />
                  <ElTree
                    ref={treeRef}
                    show-checkbox
                    node-key="id"
                    highlight-current
                    default-expand-all
                    check-strictly={false}
                    expand-on-click-node={false}
                    data={treeData.value}
                    onNode-click={nodeClick}
                  >
                    {{
                      default: (data) => {
                        return <span>{t(data.data.meta.title)}</span>
                      }
                    }}
                  </ElTree>
                </div>
                <div class="flex-1">
                  {unref(currentTreeData) && unref(currentTreeData)?.permissionList ? (
                    <div class="flex gap-4">
                      <ElCheckbox
                        v-model={unref(currentTreeData).meta.checkAll}
                        indeterminate={unref(currentTreeData).meta?.isIndeterminate}
                        onChange={handleCheckAllChange}
                        style={{
                          display:
                            unref(currentTreeData)?.permissionList.length > 1 ? 'block' : 'none'
                        }}
                      >
                        全选
                      </ElCheckbox>
                      <ElCheckboxGroup
                        v-model={unref(currentTreeData).permissions}
                        onChange={handleCheckChange}
                      >
                        {unref(currentTreeData)?.permissionList.map((v: any) => {
                          return <ElCheckbox label={v.name} value={v.code}></ElCheckbox>
                        })}
                      </ElCheckboxGroup>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )
        }
      }
    }
  }
])

const checkAllTreeData = ref(false)
function getAllKeys(node) {
  // 返回一个数组：当前节点的 id + 子节点的所有 id
  return [node.id, ...(node.children ? node.children.flatMap(getAllKeys) : [])]
}

const handleCheckAllTreeChange = (val: boolean) => {
  checkAllTreeData.value = val
  if (val) {
    const keys = treeData.value.flatMap(getAllKeys)
    unref(treeRef)?.setCheckedKeys(keys)
  } else {
    unref(treeRef)?.setCheckedKeys([])
  }
  eachTree(treeData.value, (v) => {
    v.permissions = val ? v.permissionList.map((v: any) => v.code) : []
  })
  console.log('🚀 ~ handleCheckAllTreeChange ~ val', val)
}
const currentTreeData = ref()
const nodeClick = (treeData: any) => {
  currentTreeData.value = treeData
  const { permissions, permissionList } = treeData

  if (permissions?.length > 0) {
    if (permissions?.length == permissionList?.length) {
      nextTick(() => {
        currentTreeData.value.meta.checkAll = true
      })
    } else {
      nextTick(() => {
        currentTreeData.value.meta.isIndeterminate = true
      })
      // handleCheckAllChange(false)
    }
  }
}

const rules = reactive({
  name: [required()],
  status: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const treeData = ref<AppCustomRouteRecordRaw[]>([])

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

const handleCheckAllChange = (val: boolean) => {
  console.log('🚀 ~ handleCheckAllChange ~ val', val)
  currentTreeData.value.permissions = val
    ? currentTreeData.value.permissionList.map((v: any) => v.code)
    : []
  currentTreeData.value.meta.isIndeterminate = false
}

const handleCheckChange = (val: string[]) => {
  const checkedCount = val.length
  currentTreeData.value.meta.checkAll = checkedCount === currentTreeData.value.permissionList.length
  currentTreeData.value.meta.isIndeterminate =
    checkedCount > 0 && checkedCount < currentTreeData.value.permissionList.length
}

const { allMenuList } = storeToRefs(menuStore)
const getMenuList = async () => {
  // 请求到总菜单及权限列表
  //  方案一 每次单独获取
  // const res = await getMenuListApi()
  //  方案二  共享  store 的 数据
  const list =
    allMenuList.value?.length > 0 ? allMenuList.value : (await menuStore.getMenuList()).list
  if (list) {
    treeData.value = list
    if (!props.currentRow?.menus) return
    // console.log('🚀 ~ getMenuList ~ props.currentRow', props.currentRow)
    await nextTick()

    const checked: any[] = []
    eachTree(props.currentRow.menus, (v) => {
      checked.push({
        id: v.id,
        permissions: v?.permissions.map((w) => w.code) || []
      })
    })
    eachTree(treeData.value, (v) => {
      const index = findIndex(checked, (item) => {
        return item.id === v.id
      })
      if (index > -1) {
        const meta = { ...(v.meta || {}) }
        v.permissions = checked[index].permissions
        v.meta = meta
      }
    })
    for (const item of checked) {
      unref(treeRef)?.setChecked(item.id, true, false)
    }
    // unref(treeRef)?.setCheckedKeys(
    //   checked.map((v) => v.id),
    //   false
    // )
    nextTick(() => {
      checkAllTreeData.value = list.length === treeData.value.length
    })
  }
}
getMenuList()

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    const checkedNodes = unref(treeRef)?.getCheckedNodes(false, true)
    const permissionIds: number[] = []
    const menuIds: number[] = []
    checkedNodes.map((v) => {
      menuIds.push(v.id)
      v.permissionList.map((w) => {
        if (v.permissions && v.permissions.includes(w.code)) {
          permissionIds.push(w.id)
        }
      })
    })
    formData.menuIds = menuIds
    formData.permissionIds = permissionIds
    delete formData.menus

    return formData
  }
}
defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
