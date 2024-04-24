/** 国际化字段数据类型 */
export type LocalesType = readonly {
  en: string
  zh_CN: string
  key?: string
  [key: string]: string | undefined
}[]

/** chrome扩展环境国际化相关方法 */
export const i18n = {
  /**
   * 初始化获取国际化字段方法
   *
   * @param locales - 国际化字段配置
   *
   * @returns 返回一个获取国际化字段的方法
   *
   * @example
   * ```
   * const getI18n = i18n.init([{ en: 'hello', zh_CN: '你好' }])
   * // 获取 “你好” 字段的国际化
   * getI18n('你好')
   * ```
   */
  init: <T extends LocalesType>(locales: T) => {
    const localeKeyMap = locales.reduce((prev, item) => {
      const { zh_CN, en, key } = item
      const fieldKey = en.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
      return { ...prev, [key || zh_CN]: key || fieldKey }
    }, {}) as any

    return <K extends T[number]>(
      key: K extends { key: string } ? K['key'] : K['zh_CN']
    ) => {
      const fieldKey = localeKeyMap[key]
      return chrome.i18n.getMessage(fieldKey)
    }
  },

  /**
   * 转换国际化字段数据
   *
   * @param locales - 国际化字段配置
   *
   * @returns 返回一个格式化后的国际化多语言配置
   *
   * @example
   * ```
   * const localeData = i18n.transfromLocales([{ en: 'hello', zh_CN: '你好' }])
   * // 输出 { en: { hello: { message: 'hello' } }, zh_CN: { hello: { message: '你好' } } }
   * console.log(localeData)
   * ```
   */
  transfromLocales: (locales: LocalesType) => {
    const localeData = { en: {}, zh_CN: {} }

    locales.forEach(fieldItem => {
      const { en, key } = fieldItem
      const fieldKey = en?.replace(/\s/g, '_')?.replace(/[^a-zA-Z0-9_]/g, '')

      Object.keys(fieldItem).forEach(localeKey => {
        if (!localeData[localeKey]) localeData[localeKey] = {}

        localeData[localeKey][key || fieldKey] = {
          message: fieldItem[localeKey],
        }
      })
    })

    return localeData
  },

  /**
   * vite-plugin，方便生成 chrome 扩展使用的国际化配置
   *
   * @param locales - 国际化字段配置
   * @param callback - 生成每种语言时触发的回调函数
   *
   * @returns 返回一个提供给 vite-plugin 的配置对象
   *
   * @example
   * ```
   * // vite 配置
   * export default defineConfig({
   *   plugins: [
   *     i18n.generateLocales(locales, (key, content) => {
   *       try {
   *         fs.writeFileSync(`public/_locales/${key}/messages.json`, content)
   *         fs.writeFileSync(`dist/_locales/${key}/messages.json`, content)
   *       } catch {}
   *     }),
   *   ],
   * })
   * ```
   */
  generateLocales: (
    locales: LocalesType,
    callback: (localeKey: string, content: string) => void
  ) => {
    return {
      name: 'generate-chrome-locales',
      buildStart() {
        const localeData = i18n.transfromLocales(locales)

        Object.keys(localeData).forEach(key => {
          const content = JSON.stringify(localeData[key], null, 2)
          callback(key, content)
        })
      },
    }
  },
}
