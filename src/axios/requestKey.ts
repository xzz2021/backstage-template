import type { AxiosRequestConfig } from 'axios'

const keyCache = new Map<string, string>()

const normalizeData = (data: any): string => {
  if (!data) return ''
  if (typeof data !== 'object') return String(data)

  const sortedMap = new Map()
  Object.keys(data)
    .sort()
    .forEach((key) => {
      sortedMap.set(key, data[key])
    })

  return JSON.stringify(Object.fromEntries(sortedMap))
}

const hash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export const getRequestKey = (config: AxiosRequestConfig): string => {
  try {
    const { method = 'get', url, data, params } = config
    const tempKey = `${method}::${url}::${JSON.stringify(params)}::${JSON.stringify(data)}`
    if (keyCache.has(tempKey)) {
      return keyCache.get(tempKey)!
    }
    const normalizedParams = params ? normalizeData(params) : ''
    const normalizedData = data ? normalizeData(data) : ''
    const keyStr = `${method}::${url}::${normalizedParams}::${normalizedData}`
    const hashedKey = hash(keyStr)

    keyCache.set(tempKey, hashedKey)

    return hashedKey
  } catch (error) {
    console.error('Error generating request key:', error)
    return `${config.method || 'get'}::${config.url}`
  }
}

export const clearKeyCache = (maxSize: number = 1000): void => {
  if (keyCache.size > maxSize) {
    const keysToDelete = Array.from(keyCache.keys()).slice(0, keyCache.size - maxSize)
    keysToDelete.forEach((key) => keyCache.delete(key))
  }
}
