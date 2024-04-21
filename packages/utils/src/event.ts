/** 部分事件电脑端和移动端不兼容 */
export class Event {
  /** 判定双击定时器 */
  private dbclickTimer = null as unknown as number

  /** 短时间内触发事件的次数 */
  private dbclickCount = 0

  /** 重置和双击事件有关的数据 */
  private resetDbclickData = () => {
    clearTimeout(this.dbclickTimer)
    this.dbclickCount = 0
    this.dbclickTimer = null as unknown as number
  }

  /**
   * 双击事件
   *
   * @param callback - 触发双击时调用的回调函数
   * @param [params] - 传给回调函数的rest参数
   * 
   * @example
   * ```
   * // 初始化
   * const event = new Event()
   * // 需要执行的 双击 删除方法
   * const delete = e => { } 
   * // 在 jsx 或其他场景中使用
   * <div onClick={e => event.dbclick(delete, e)}></div>
   * ```
   */
  dbclick = <T extends any[]>(
    callback: (...params: T) => void,
    ...params: T
  ) => {
    this.dbclickCount++

    if (this.dbclickCount >= 2) {
      callback?.(...params)
      this.resetDbclickData()
    }

    if (this.dbclickTimer) return
    this.dbclickTimer = setTimeout(this.resetDbclickData, 300)
  }
}
