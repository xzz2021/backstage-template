import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { AudioTypes, DocTypes, FileIcon, ImageTypes, VideoTypes, ZipTypes } from '@/constants/file'

export const formatFileSize = (size: number) => {
  let formatSize = ''
  if (size > 1024 * 1024 * 1024) {
    formatSize = `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  } else if (size > 1024 * 1024) {
    formatSize = `${(size / 1024 / 1024).toFixed(2)} MB`
  } else if (size > 1024) {
    formatSize = `${(size / 1024).toFixed(2)} KB`
  } else {
    formatSize = `${size} B`
  }
  return formatSize
}

// 计算文件的sha256
export const getFileSha256 = async (file: File) => {
  const buffer = await file.arrayBuffer() // 将文件转换为 ArrayBuffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer) // 计算哈希值
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // 转换为字节数组
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('') // 转换为十六进制字符串
  return hashHex
}

export const getFileIcon = (extension: string) => {
  return FileIcon[extension]
}

export const isImage = (extension: string) => {
  return ImageTypes.includes(extension)
}

type FileType = 'image' | 'video' | 'doc' | 'other' | 'audio' | 'zip'
export const getFileType = (extension: string): FileType => {
  if (ImageTypes.includes(extension)) {
    return 'image'
  } else if (VideoTypes.includes(extension)) {
    return 'video'
  } else if (DocTypes.includes(extension)) {
    return 'doc'
  } else if (AudioTypes.includes(extension)) {
    return 'audio'
  } else if (ZipTypes.includes(extension)) {
    return 'zip'
  } else {
    return 'other'
  }
}

export const getFileIcon2 = (extension: string) => {
  const type = getFileType(extension)
  // console.log('xzz2021: type', type)
  switch (type) {
    case 'image':
      return 'material-icon-theme:folder-aws-open'
    case 'video':
      return 'material-icon-theme:video'
    case 'doc':
      return 'material-icon-theme:document'
    case 'audio':
      return 'material-icon-theme:audio'
    case 'zip':
      return 'material-icon-theme:zip'
    default:
      return 'material-icon-theme:bun-light'
  }
}

export function downloadFile({
  url,
  target = '_blank',
  fileName
}: {
  url: string
  target?: '_self' | '_blank'
  fileName?: string
}): Promise<boolean> {
  // 是否同源
  const isSameHost = new URL(url).host === location.host
  return new Promise<boolean>((resolve, reject) => {
    if (isSameHost) {
      // 同源资源，直接使用 <a> 标签下载
      const link = document.createElement('a')
      link.href = url
      link.target = target

      if (link.download !== undefined) {
        link.download = fileName || url.split('.').pop() || 'download'
      }

      if (document.createEvent) {
        const e = document.createEvent('MouseEvents')
        e.initEvent('click', true, true)
        link.dispatchEvent(e)
        return resolve(true)
      }

      if (!url.includes('?')) {
        url += '?download'
      }

      window.open(url, target)
      return resolve(true)
    } else {
      // 跨域资源，使用 fetch 获取文件并下载
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = fileName || url.split('.').pop() || 'download'
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(link.href)
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    }
  })
}

export const formatDataFn = (data: any[]) => {
  return data.map((item) => {
    const { id, children, permissionList, parentId, meta, ...rest } = item
    // 移除meta和permissionList的id
    if (meta) {
      delete meta.id
    }
    if (permissionList) {
      permissionList.forEach((item: any) => {
        delete item.id
      })
    }

    return {
      ...rest,
      permissionList: permissionList?.length ? permissionList : undefined,
      meta: meta ? meta : undefined,
      children: children?.length ? formatDataFn(children) : undefined
    }
  })
}

export const exportSeedData = (data: any[], fileName: string, download = false) => {
  if (!data?.length) {
    ElMessage.error('数据为空')
    return
  }
  // const jsonData = formatDataFn(data)
  const jsonData = JSON.stringify(data, null, 2)
  // 导出下载
  if (download) {
    downloadFile({
      url: 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData),
      fileName: `${fileName}-seed.json`
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(jsonData)
    ElMessage.success('复制成功')
  }
}

export const exportExcelData = (
  dataList: any[],
  fileName: string = 'filename',
  column?: { label: string; key: string }[]
) => {
  let worksheet
  if (column?.length) {
    const aoa = [
      column.map((c) => c.label),
      ...dataList.map((row) => column.map((c) => row[c.key] ?? ''))
    ]
    worksheet = XLSX.utils.aoa_to_sheet(aoa)
  } else {
    worksheet = XLSX.utils.json_to_sheet(dataList)
  }
  // 计算每一列的最大宽度（基于字符串长度）
  const colWidths = Object.keys(dataList[0]).map((key) =>
    Math.max(
      key.length, // 表头宽度
      ...dataList.map((row) => String(row[key]).length) // 数据宽度
    )
  )

  // 设置列宽（wch = char width）
  worksheet['!cols'] = colWidths.map((w) => ({ wch: w < 20 ? 20 : w + 6 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, fileName)
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
