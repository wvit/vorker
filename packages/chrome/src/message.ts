/**
 * 注册消息事件
 *
 * @param messages - 需要绑定的 message 事件列表
 *
 * @returns 返回一个包含对应 message 事件的相关操作方法
 *
 * @example
 * ```
 * // 定义枚举值
 * enum Action {
 *   GetData = 'getData',
 * }
 * // 消息管理器
 * const Message = registerMessage([
 *  {
 *     name: 'background',
 *     type: 'normal',
 *     action: Action,
 *   },
 * ])
 * // 向 background 中发送 message
 * Message.background.send(Action.GetData)
 * // 监听 background 的相关 message 事件
 * Message.background.on(Action.GetData, () => {})
 * ```
 */
export const registerMessage = <
  T extends string,
  U extends keyof ReturnType<typeof messageHandleMap>,
  K
>(
  messages: { name: T; type: U; action: K }[]
) => {
  const messageEventMap = messages?.reduce((prev, item) => {
    const { name, type } = item
    return { ...prev, [name]: messageHandleMap()[type] }
  }, {})

  return messageEventMap as Record<
    T,
    ReturnType<typeof messageHandleMap<K[keyof K]>>[U]
  >
}

/** 不同类型 message 事件执行的方法 */
const messageHandleMap = <T>() => ({
  /** 向 background 或 action 环境发送或监听的 message 事件 */
  normal: {
    send: (action: T, message?: any) => {
      return chrome.runtime.sendMessage({ action, ...message })
    },

    on: (
      action: T,
      callback: (
        message: any,
        sendResponse: (data?: any) => void,
        sender: any
      ) => void
    ) => {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (action === message.action) {
          callback?.(message, sendResponse, sender)
          /** 返回 true，告诉chrome.runtime， 这个 sendResponse 会后续响应 */
          return true
        }
      })
    },
  },

  /** 向 content 环境或其他标签页发送或监听 message 事件 */
  tabs: {
    send: (tabId: number, action: T, message?: any) => {
      return chrome.tabs.sendMessage(tabId, { action, ...message })
    },

    activeSend: async (action: T, message?: any) => {
      const activeTab = (
        await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
      )[0]

      if (activeTab) {
        return chrome.tabs.sendMessage(activeTab.id!, { action, ...message })
      }
    },

    on: (
      action: T,
      callback: (
        message: any,
        sendResponse: (data?: any) => void,
        sender: any
      ) => void
    ) => {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (action === message.action) {
          callback?.(message, sendResponse, sender)
          return true
        }
      })
    },
  },

  /** window 之间 message 事件 */
  window: {
    send: (target: Window, action: T, message?: any) => {
      target.postMessage({ action, ...message }, '*')
    },

    on: (action: T, callback: (event: MessageEvent) => void) => {
      window.addEventListener('message', (e: MessageEvent) => {
        if (action === e.data.action) {
          callback?.(e)
        }
      })
    },
  },
})
