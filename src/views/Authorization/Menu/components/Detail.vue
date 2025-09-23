<script setup lang="tsx">
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'
import { useMenuStore } from '@/store/modules/menu'
import { ElTag } from 'element-plus'
import { PropType, ref } from 'vue'

defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => undefined
  }
})

const { t } = useI18n()

const renderTag = (enable?: boolean) => {
  return (
    <ElTag type={enable ? 'success' : 'danger'}>
      {enable ? t('userDemo.enable') : t('userDemo.disable')}
    </ElTag>
  )
}

const detailSchema = ref<DescriptionsSchema[]>([
  {
    field: 'type',
    label: t('menu.menuType'),
    slots: {
      default: (data) => {
        const type = data.type
        return <>{type === 1 ? t('common.menu') : t('common.directory')}</>
      }
    }
  },
  {
    field: 'parentId',
    label: t('menu.parentMenu'),
    slots: {
      default: (data) => {
        const parentId = data.parentId
        const parentName = useMenuStore().getAllMenuList.find((item) => item.id === parentId)?.meta
          ?.title
        return <>{parentName ? t(parentName) : '-'}</>
      }
    }
  },
  {
    field: 'meta.title',
    label: t('menu.menuName'),
    slots: {
      default: (data) => {
        const title = data.meta.title
        return <>{title ? t(title) : '-'}</>
      }
    }
  },
  {
    field: 'meta.icon',
    label: t('menu.icon'),
    slots: {
      default: (data) => {
        const icon = data.meta.icon
        return icon ? <Icon icon={icon} /> : null
      }
    }
  },
  {
    field: 'component',
    label: t('menu.component'),
    span: 24,
    slots: {
      default: (data) => {
        const component = data.component
        return (
          <div class="  truncate ">
            {component === '#'
              ? t('menu.topDirectory')
              : component === '##'
                ? t('menu.subDirectory')
                : component}
          </div>
        )
      }
    }
  },
  {
    field: 'name',
    label: t('menu.menuName')
  },
  {
    field: 'path',
    label: t('menu.path')
  },
  {
    field: 'meta.activeMenu',
    label: t('menu.activeMenu'),
    slots: {
      default: (data) => renderTag(data.activeMenu)
    }
    // slots: {
    //   default: (data) => {
    //     return renderTag(data.activeMenu)
    //   }
    // }
  },
  // {
  //   field: 'permissionList',
  //   label: t('menu.buttonPermission'),
  //   span: 24,
  //   slots: {
  //     default: (data: any) => (
  //       <>
  //         {data?.permissionList?.map((v) => {
  //           return (
  //             <ElTag class="mr-1" key={v.value}>
  //               {v.label}
  //             </ElTag>
  //           )
  //         })}
  //       </>
  //     )
  //   }
  // },
  // {
  //   field: 'menuState',
  //   label: t('menu.menuState'),
  //   slots: {
  //     default: (data) => {
  //       return renderTag(data.menuState)
  //     }
  //   }
  // },
  {
    field: 'meta.hidden',
    label: t('menu.hidden'),
    slots: {
      default: (data) => {
        return renderTag(data.enableHidden)
      }
    }
  },
  {
    field: 'meta.alwaysShow',
    label: t('menu.alwaysShow'),
    slots: {
      default: (data) => {
        return renderTag(data.enableDisplay)
      }
    }
  },
  {
    field: 'meta.noCache',
    label: t('menu.noCache'),
    slots: {
      default: (data) => {
        return renderTag(data.enableCleanCache)
      }
    }
  },
  {
    field: 'meta.breadcrumb',
    label: t('menu.breadcrumb'),
    slots: {
      default: (data) => {
        return renderTag(data.enableShowCrumb)
      }
    }
  },
  {
    field: 'meta.affix',
    label: t('menu.affix'),
    slots: {
      default: (data) => {
        return renderTag(data.enablePinnedTab)
      }
    }
  },
  {
    field: 'meta.noTagsView',
    label: t('menu.noTagsView'),
    slots: {
      default: (data) => {
        return renderTag(data.enableHiddenTab)
      }
    }
  },
  {
    field: 'meta.canTo',
    label: t('menu.canTo'),
    slots: {
      default: (data) => {
        return renderTag(data.enableSkip)
      }
    }
  }
])
</script>

<template>
  <Descriptions :schema="detailSchema" :data="currentRow || {}" />
</template>
