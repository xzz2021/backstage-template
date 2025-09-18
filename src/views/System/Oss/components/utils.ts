import { downloadObjectApi, downloadFolderApi } from '@/api/oss'

import { AxiosResponse, RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios'
import { ElMessage } from 'element-plus'

// 根据后端返回的headers里传递的文件名进行命名
const getFilenameFromHeader = (headers: RawAxiosResponseHeaders | AxiosResponseHeaders) => {
  const contentDisposition = headers['content-disposition']
  let filename = 'download.zip'
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/)
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1])
    }
  }
  return filename
}

export const downloadFile = async (rawName: string, isFolder: boolean = false) => {
  try {
    const blob: AxiosResponse<Blob> = isFolder
      ? await downloadFolderApi({
          folderPath: rawName
        })
      : await downloadObjectApi({
          objectName: rawName
        })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob.data)
    const link = document.createElement('a')
    link.href = url

    // 从文件名中提取实际的文件名（去掉路径前缀）
    const fileName = rawName.split('/').pop() || rawName
    link.download = isFolder ? getFilenameFromHeader(blob.headers) : fileName

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('文件下载失败')
  }
}
