<script setup lang="tsx">
import { DepartmentUserItem } from '@/api/department/types'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { useI18n } from '@/hooks/web/useI18n'
import { formatToDateTime } from '@/utils/dateUtil'
import { ElTag } from 'element-plus'
import { PropType, ref } from 'vue'
defineProps({
  currentRow: {
    type: Object as PropType<DepartmentUserItem>,
    default: () => undefined
  }
})

const { t } = useI18n()

const detailSchema = ref<DescriptionsSchema[]>([
  {
    field: 'username',
    label: t('userDemo.username')
  },
  {
    field: 'phone',
    label: '手机号'
  },
  {
    field: 'department.name',
    label: '部门'
  },
  {
    field: 'status',
    label: '状态',
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElTag type={data.status ? 'success' : 'danger'}>
              {data.status ? t('userDemo.enable') : t('userDemo.disable')}
            </ElTag>
          </>
        )
      }
    }
  },
  {
    field: 'roleArr',
    label: '角色',
    span: 24,
    slots: {
      default: (data: any) => {
        const roles = data?.roleArr
        return roles ? (
          <>
            {roles.map((v) => (
              <ElTag type="success" class="mr-10px">
                {v.name}
              </ElTag>
            ))}
          </>
        ) : (
          <></>
        )
      }
    }
  },

  {
    field: 'createdAt',
    label: '创建时间',
    width: '165px',
    span: 24,
    slots: {
      default: (data: any) => {
        return <>{formatToDateTime(data.createdAt)}</>
      }
    }
  }
])
</script>

<template>
  <Descriptions :schema="detailSchema" :data="currentRow || {}" />
</template>
