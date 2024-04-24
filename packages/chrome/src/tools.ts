/** 操作chrome缓存 */
export const local = {
  /** 获取chrome数据缓存 */
  async get(key: string) {
    const store = await chrome.storage.local.get(key)
    return store[key]
  },

  /** 设置chrome数据缓存 */
  async set(data: Record<string, any>) {
    return chrome.storage.local.set(data)
  },

  /** 删除一个或多个缓存 */
  async remove(keys: string | string[]) {
    return chrome.storage.local.remove(keys)
  },
}

/** 获取 chrome 扩展资源 */
export const getResource = (path: string) => chrome.runtime.getURL(path)

/**
 * 凡是没有提供 Promise 的 chrome api 都需要这个方法来捕获 chrome.runtime.lastError 报错。
 *
 * @param api - 需要执行的 api 方法
 * @param ...params - 需要传递给 api 的参数
 *
 * @returns 返回原 api 调用的返回值
 *
 * @example
 * ```
 * catchLastError(chrome.contextMenus.create, {
 *   id: 'save',
 *   title: '保存',
 *   contexts: ['page'],
 * })
 * ```
 */
export const catchLastError = <T extends (...params) => any>(
  api: T,
  ...params: Parameters<T>
): ReturnType<T> => {
  return api(...params, () => {
    const lastError = chrome.runtime.lastError
    if (lastError) {
      console.log('last error:', lastError.message)
    }
  })
}
