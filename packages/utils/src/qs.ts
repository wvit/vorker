/** querystring 相关方法 */
export const qs = {
  /**
   * 获取当前 url query数据
   *
   * @returns 返回当前 location.href 上的 query 参数
   *
   * @example
   * ```
   * // 获取当前 location.href="/detail?id=1&name=test" 的 query参数
   * const queryData = qs.getQuery()
   * // 输出：{ id: '1', name: 'test' }
   * console.log(queryData)
   * ```
   */
  getQuery: () => {
    const query = qs.parse(location?.search) || {}
    return query
  },

  /**
   * 将 url 中 query 参数提取出来
   *
   * @param url - 需要提取 query 参数的 url 字符串
   *
   * @returns 返回 url 上 query 参数
   *
   * @example
   * ```
   * const queryData = qs.parse('/detail?id=1&name=test')
   * // 输出：{ id: '1', name: 'test' }
   * console.log(queryData)
   * ```
   */
  parse: (url: string) => {
    const queryString = url.split('?')[1] || url.split('?')[0]

    return queryString
      .split('&')
      .reduce<any>((query: Record<string, any>, item: string) => {
        const [key, value] = item.split('=').map(decodeURIComponent)

        if (key) {
          query[key] = value
          return query
        }
      }, {})
  },

  /**
   * 将对象拼接为 queryString
   *
   * @param query - query 参数对象
   * @param [url] -  需要拼接的 url
   *
   * @returns 返回一个带有 query 参数的 url 字符串
   *
   * @example
   * ```
   * const url = qs.stringify({ id: 1, name: 'test' }, '/detail')
   * // 输出：/detail?id=1&name=test
   * console.log(url)
   * ```
   */
  stringify: (query: Record<string, any>, url?: string) => {
    const queryString = Object.keys(query)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
      )
      .join('&')

    return url !== undefined ? `${url}?${queryString}` : queryString
  },
}
