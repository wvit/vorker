import type { Properties, PropertiesHyphen } from 'csstype'

/**
 * 获取一个指定长度的数组
 *
 * @param length - 数组长度
 *
 * @returns 返回一个指定长度的数组，并填充索引值
 *
 * @example
 * ```
 * // 输出：[0,1,2,3,4]
 * console.log(getArr(5))
 * ```
 */
export const getArr = (length: number) => {
  return Array(length)
    .fill(null)
    .map((_, index) => index)
}

/**
 * 获取数组中的随机项
 *
 * @param arr - 一个任意内容的数组
 * @param [length] - 需要随机获取多少个数据项。默认为 1
 *
 * @returns 返回一个数组
 *
 * @example
 * ```
 * // 获取数组中的随机 2 项
 * const arr = getArrRandom([1,2,3,4,5], 2)
 * ```
 */
export const getArrRandom = (arr: any[], length = 1) => {
  if (!arr?.length) return []
  return getArr(length).map(() => {
    return arr[Math.ceil(Math.random() * (arr.length - 1))]
  })
}

/**
 * 获取一个指定范围的随机整数
 *
 * @param max - 随机数的最大值
 * @param [min] -随机数的最小值
 *
 * @returns 返回一个随机整数
 *
 * @example
 * ```
 * // 获取一个 5 - 10 范围内的随机整数
 * const count = getRandom(10, 5)
 * ```
 */
export const getRandom = (max: number, min = 0) => {
  return min + Math.ceil(Math.random() * (max - min))
}

/**
 * 获取一个20位长度的随机id
 *
 * @returns 返回一个 20 位长度的随机字符串
 *
 * @example
 * ```
 * // 获取一个随机id
 * const id = getId()
 * ```
 */
export const getId = () => {
  return Math.random().toString().slice(2) + getRandom(9999)
}

/**
 * 将 style 对象转为 htmlElement 上的 style 字符串
 *
 * @param style - 一个 style 样式对象
 *
 * @returns 返回一个内联样式字符串
 *
 * @example
 * ```
 * // 将 style 对象转为内联样式字符串
 * const styleString = styleToString({ 'font-size': '12px', color: 'red' })
 * // 输出："font-size:12px;color:red;"
 * console.log(styleString)
 * ```
 */
export const styleToString = (style: Properties | PropertiesHyphen) => {
  const styleString = Object.keys(style).reduce((prev, key) => {
    return `${prev} ${key}:${style[key]};`
  }, '')
  return styleString
}
