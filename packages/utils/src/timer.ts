/**
 * 睡眠定时器，一般用于防止触发机器人验证或等待节点加载等场景
 *
 * @param time - 需要延时多少毫秒
 *
 * @example
 * ```
 * // 延时 500ms
 * await sleep(500)
 * ```
 */
export const sleep = (time: number) => {
  return new Promise<void>(resolve => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve()
    }, time)
  })
}

/**
 * 定时循环检测器
 *
 * @param callback - 回调函数，返回布尔值来判断检测是否完成
 * @param [options.time] - 间隔多少 毫秒 检测一次。默认为 20
 * @param [options.maxCount] - 最多检测多少次。默认为 100
 *
 * @example
 * ```
 * // 等待异步结束，间隔 1000ms 检测一次登录状态，最多检测 10次。
 * await inspectTimer(() => {
 *   return login.status
 * },
 * }, { time: 1000, maxCount: 10 })
 * ```
 */
export const inspectTimer = (
  callback: (count: number) => boolean | Promise<boolean>,
  options?: { time?: number; maxCount?: number }
) => {
  const { time = 20, maxCount = 100 } = options || {}
  const isAsync = callback.constructor.name === 'AsyncFunction'

  return new Promise<void>(resolve => {
    let count = 0

    /** 同步函数使用 setIntervalue, 异步函数使用 setTimeout */
    if (isAsync) {
      const next = async () => {
        count++

        try {
          if (count > maxCount || (await callback(count))) {
            return resolve()
          }
        } catch (e) {
          console.error('inspectTimer 出错', e)
          return resolve()
        }

        const timer = setTimeout(() => {
          clearTimeout(timer)
          next()
        }, time)
      }

      next()
    } else {
      const timer = setInterval(() => {
        const done = () => {
          clearInterval(timer)
          resolve()
        }

        count++

        try {
          if (count > maxCount || callback(count)) done()
        } catch (e) {
          done()
          console.error('inspectTimer 出错', e)
        }
      }, time)
    }
  })
}
