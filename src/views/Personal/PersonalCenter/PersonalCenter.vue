<script setup lang="ts">
import { getPersonByIdApi } from '@/api/user'
import defaultAvatar from '@/assets/imgs/avatar.jpg'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { useUserStore } from '@/store/modules/user'
import { ElButton, ElDivider, ElImage, ElMessage, ElTabPane, ElTabs, ElTag } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, unref } from 'vue'
import EditInfo from './components/EditInfo.vue'
import EditPassword from './components/EditPassword.vue'
import UploadAvatar from './components/UploadAvatar.vue'

const { t } = useI18n()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const activeName = ref('first')
const dialogVisible = ref(false)
const uploadAvatarRef = ref<ComponentRef<typeof UploadAvatar>>()
const avatarLoading = ref(false)

const fetchDetailUserApi = async () => {
  const res = await getPersonByIdApi()
  if (res.data) {
    userStore.setUserInfo(res.data.userinfo)
  } else {
    ElMessage.error('获取用户信息失败,请刷新页面!')
  }
}
fetchDetailUserApi()

const saveAvatar = async () => {
  try {
    avatarLoading.value = true
    const imgUrl = await unref(uploadAvatarRef)?.getAvatarUrl()
    // 这里可以调用修改头像接口
    if (imgUrl) {
      dialogVisible.value = false
      userInfo?.value &&
        userStore.setUserInfo({
          ...userInfo.value,
          avatar: imgUrl
        })
    }
  } catch (error) {
    console.log(error)
  } finally {
    avatarLoading.value = false
  }
}
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap :title="t('userDemo.personalInfo')" class="w-400px">
      <div class="flex justify-center items-center">
        <div
          class="avatar w-[150px] h-[150px] relative cursor-pointer"
          @click="dialogVisible = true"
        >
          <ElImage
            class="w-[150px] h-[150px] rounded-full"
            :src="userInfo?.avatar || defaultAvatar"
            fit="fill"
          />
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>{{ t('login.username') }}:</div>
        <div>{{ userInfo?.username }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>{{ t('login.phone') }}:</div>
        <div>{{ userInfo?.phone ?? '-' }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>{{ t('userDemo.email') }}:</div>
        <div>{{ userInfo?.email ?? '-' }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>{{ t('role.role') }}:</div>
        <div>
          <template v-if="userInfo?.roles?.length">
            <ElTag v-for="item in userInfo?.roles || []" :key="item.id" class="ml-2 mb-w"
              >{{ item.name }}
            </ElTag>
          </template>
          <template v-else>-</template>
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>{{ t('userDemo.department') }}:</div>
        <div
          ><ElTag>
            {{ userInfo?.departments?.map((item) => item.name).join(',') ?? '-' }}
          </ElTag>
        </div>
      </div>
      <ElDivider />
      <div class="flex items-center justify-center">
        <div class="text-12px">{{ t('tableDemo.createdAt') }}:{{ userInfo?.createdAt || '-' }}</div>
      </div>
    </ContentWrap>
    <ContentWrap :title="t('userDemo.basicInfo')" class="flex-[3] ml-20px">
      <ElTabs v-model="activeName">
        <ElTabPane :label="t('userDemo.personalInfo')" name="first">
          <EditInfo :user-info="userInfo" @refresh="fetchDetailUserApi" />
        </ElTabPane>
        <ElTabPane :label="t('userDemo.password')" name="second">
          <EditPassword :userid="userInfo?.id || 0" />
        </ElTabPane>
      </ElTabs>
    </ContentWrap>
  </div>

  <Dialog v-model="dialogVisible" title="修改头像" width="800px">
    <UploadAvatar
      ref="uploadAvatarRef"
      :url="userInfo?.avatar || defaultAvatar"
      :user-id="userInfo?.id || 0"
    />

    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
      <ElButton type="primary" :loading="avatarLoading" @click="saveAvatar"> 保存 </ElButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
.avatar {
  position: relative;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    font-size: 50px;
    color: #fff;
    background-color: rgb(0 0 0 / 40%);
    border-radius: 50%;
    content: '+';
    opacity: 0;
    justify-content: center;
    align-items: center;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}
</style>
