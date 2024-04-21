import { dom } from './dom'

/** 剪切板功能 */
export const clipboard = {
  /**
   * 向剪切板写入文本
   *
   * @param content - 需要复制的文本内容
   *
   * @example
   * ```
   * // 复制 “hello” 到剪切板
   * await clipboard.writeText('hello')
   * ```
   */
  writeText: async (content: string) => {
    try {
      /** 非 https 页面，浏览器可能会限制 navigator.clipboard 相关api  */
      await navigator.clipboard.writeText(content)
    } catch (e) {
      /** 降级使用 document.execCommand 复制文本 */
      const copyNode = dom.create('textarea', {
        style: 'position:absolute;opacity: 0;',
      })

      dom.query('body').add(copyNode)
      copyNode.value = content
      copyNode.select()
      document.execCommand('Copy')
      copyNode.remove()
    }
  },

  /** TODO：读取剪切板内容 */
  readText: () => {},
}
