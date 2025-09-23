<script setup lang="tsx">
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { PropType } from 'vue'

import { DictionaryEntry } from '@/api/dictionary/types'
import { useI18n } from '@/hooks/web/useI18n'
import { formatToDateTime } from '@/utils/dateUtil'
import { ElTag } from 'element-plus'
import { reactive } from 'vue'
defineProps({
  currentRow: {
    type: Object as PropType<Nullable<DictionaryEntry>>,
    default: () => null
  }
})

const { t } = useI18n()

const detailSchema = reactive<DescriptionsSchema[]>([
  {
    field: 'name',
    label: t('userDemo.departmentName')
  },
  {
    field: 'status',
    label: t('userDemo.status'),
    slots: {
      default: (data: any) => {
        const status = data?.status
        return <ElTag type={status ? 'success' : 'danger'}>{status ? '启用' : '禁用'}</ElTag>
      }
    }
  },
  {
    field: 'createdAt',
    label: t('tableDemo.displayTime'),
    // width: '400px',
    slots: {
      default: (data: any) => {
        return <>{formatToDateTime(data.createdAt)}</>
      }
    }
  },
  {
    field: 'remark',
    label: t('userDemo.remark')
  }
])
</script>

<template>
  <Descriptions :schema="detailSchema" :data="currentRow || {}" />
</template>
