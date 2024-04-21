/**
 * 传入一个时间戳，返回一个日期字符串
 *
 * @param time - 时间戳
 * @param [options.full] - 是否补全 时:分:秒。默认为 true
 * @param [options.offsetHour] - 需要偏移多少个小时
 *
 * @returns 返回一个日期字符串 年-月-日 时:分:秒
 *
 * @example
 * ```
 * // 获取昨天此刻的时间
 * const yesterday = getDate(Date.now(), { offsetHour: 24 })
 * ```
 */
export const getDate = (
  time: number,
  options?: {
    full?: boolean
    offsetHour?: number
  }
) => {
  const { full = true, offsetHour = 0 } = options || {}
  const date = new Date(time + offsetHour * 1000 * 60 * 60)
  /** 数值如果小于10, 则补0 */
  const judge = (key: string, offset = 0) => {
    const value = date[key]() + offset
    return value < 10 ? `0${value}` : value
  }
  /** 生成 年-月-日 */
  const transfromDate1 = `${judge('getFullYear')}-${judge(
    'getMonth',
    1
  )}-${judge('getDate')}`
  /** 生成 年-月-日 时:分:秒 */
  const transfromDate2 = `${transfromDate1} ${judge('getHours')}:${judge(
    'getMinutes'
  )}:${judge('getSeconds')}`

  return full ? transfromDate2 : transfromDate1
}
