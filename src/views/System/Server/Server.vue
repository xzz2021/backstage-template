<script setup lang="ts">
import { getServerInfoApi } from '@/api/system'
import { ServerInfoResponse } from '@/api/system/types'
import { ContentWrap } from '@/components/ContentWrap'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { formatTimeBySeconds } from '@/utils/dateUtil'
import { ElDescriptions, ElDescriptionsItem, ElTable, ElTableColumn } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

const { loadStart, loadDone } = usePageLoading()
const serverInfo = ref<ServerInfoResponse>()

const getServerInfo = async () => {
  const res = await getServerInfoApi()
  console.log(res)
  serverInfo.value = res.data
}
const uptime = ref<number>(0)
onMounted(async () => {
  loadStart()
  await getServerInfo()
  uptime.value = Number(serverInfo.value!.node.uptime)
  serverInfo.value!.node.uptime = formatTimeBySeconds(uptime.value)

  loadDone()
  setInterval(() => {
    uptime.value++
    serverInfo.value!.node.uptime = formatTimeBySeconds(uptime.value)
  }, 1000)
  // setInterval(() => {
  //   getServerInfo()
  // }, 5000)
})

const cpuTableData = computed(() => {
  return Object.keys(serverInfo.value?.cpu || {}).map((key) => ({
    value: serverInfo.value?.cpu?.[key],
    key:
      key === 'cpuNum'
        ? '核心数'
        : key === 'used'
          ? '用户使用率'
          : key === 'sys'
            ? '系统使用率'
            : '当前空闲率'
  }))
})

const memTableData = computed(() => {
  // total 总内存
  // used 已使用内存
  // free 剩余内存
  // usage 使用率
  return Object.keys(serverInfo.value?.mem || {}).map((key) => ({
    value: serverInfo.value?.mem?.[key],
    key:
      key === 'total'
        ? '总内存'
        : key === 'used'
          ? '已使用内存'
          : key === 'free'
            ? '剩余内存'
            : '使用率'
  }))
})

const simpleTableData = [
  { label: '属性', prop: 'key' },
  { label: '值', prop: 'value' }
]

const serverInfoTableData = computed(() => {
  return Object.keys(serverInfo.value?.sys || {}).map((key) => ({
    value: serverInfo.value?.sys?.[key],
    key:
      key === 'computerName'
        ? '计算机名称'
        : key === 'osName'
          ? '操作系统'
          : key === 'computerIp'
            ? '计算机IP'
            : '操作系统架构'
  }))
})

const backendServiceTableData = computed(() => {
  return Object.keys(serverInfo.value?.node || {}).map((key) => ({
    value: serverInfo.value?.node?.[key],
    key:
      key === 'title'
        ? '标题'
        : key === 'version'
          ? '版本'
          : key === 'execPath'
            ? '执行路径'
            : key === 'argv'
              ? '参数'
              : key === 'cwd'
                ? '当前工作目录'
                : '运行时间'
  }))
})

const diskTableColumn = [
  { label: '目录名称', prop: 'dirName' },
  { label: '系统类型', prop: 'sysTypeName' },
  { label: '类型', prop: 'typeName' },
  { label: '总大小', prop: 'total' },
  { label: '剩余大小', prop: 'free' },
  { label: '已使用大小', prop: 'used' },
  { label: '使用率', prop: 'usage' }
]
</script>
<template>
  <div class="flex flex-col gap-10px w-full">
    <div class="flex gap-20px w-full">
      <!--     flex: 1; -->
      <ContentWrap title="CPU" style="flex: 1">
        <el-table :data="cpuTableData" style="width: 100%">
          <el-table-column
            v-for="item in simpleTableData"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
          />
        </el-table>
      </ContentWrap>
      <ContentWrap title="内存" style="flex: 1">
        <el-table :data="memTableData" style="width: 100%">
          <el-table-column
            v-for="item in simpleTableData"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
          />
        </el-table>
      </ContentWrap>
    </div>
    <ContentWrap title="服务器信息">
      <el-descriptions border>
        <el-descriptions-item v-for="item in serverInfoTableData" :key="item.key" :label="item.key">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>
    </ContentWrap>

    <ContentWrap title="后端服务">
      <el-table :data="backendServiceTableData">
        <el-table-column
          v-for="item in simpleTableData"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        />
      </el-table>
    </ContentWrap>

    <ContentWrap title="磁盘状态">
      <el-table :data="serverInfo?.sysFiles" style="width: 100%">
        <el-table-column
          v-for="item in diskTableColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        />
      </el-table>
    </ContentWrap>
  </div>
</template>
