/** 节点拓展方法 */
export interface DomExtensionMethods {
  /** 操作属性方法 */
  attr: <T>(key: string, value?: T) => T extends string ? Node : string
  /** 获取元素节点在浏览器的数据信息 */
  rect: () => Record<string, any>
  /** 添加子元素节点 */
  add: (child: Node) => Node
  /** 销毁当前元素节点 */
  destroy: () => Node
  /** 创建并添加子元素节点 */
  create: (tagName: string, attr: Record<string, any>) => Node
  /** 设置元素节点样式 */
  setStyle: (style: Record<string, string>) => Node
  /** 其他属性/方法 */
  [key: string]: any
}

/** 元素节点的扩展类型 */
export type Node = HTMLElement &
  Element &
  HTMLInputElement &
  DomExtensionMethods

/** 一些简化操作Dom的方法 */
export const dom = {
  /**
   * 获取单个元素节点
   *
   * @param select - css选择器
   * @param [parent] - 父级节点 或 要查询的文档对象
   *
   * @returns 查询到的元素节点
   *
   * @example
   * ```
   * // 获取页面中 class = "user-name" 的元素节点
   * const userName = dom.query('.user-name')
   * ```
   */
  query(select: string, parent?: Node | Document) {
    const node = (parent || document).querySelector(select) as Node
    return dom.setMethods(node)
  },

  /**
   * 通过Id获取单个元素节点（适用于获取数字开头的 id 元素节点）
   *
   * @param id - id选择器
   * @param [parent] - 父级节点 或 要查询的文档对象
   *
   * @returns 查询到的元素节点
   *
   * @example
   * ```
   * // 获取页面中 id = "0817" 的元素节点 (非数字开头场景推荐使用 dom.query('#id-0817'))
   * const userId = dom.queryId('0817')
   * ```
   */
  queryId(id: string, parent?: Node | Document) {
    /** querySelector 无法获取 id 为数字开头的节点 */
    const node = (parent || document).getElementById(id) as Node
    return dom.setMethods(node)
  },

  /**
   * 获取多个元素节点
   *
   * @param select - css选择器
   * @param [parent] - 父级节点 或 要查询的文档对象
   *
   * @returns 返回查询到的元素节点数组
   *
   * @example
   * ```
   * // 获取 class="item-name" 的所有元素节点
   * const names = dom.queryAll('.item-name')
   * ```
   */
  queryAll(select: string, parent?: Node | Document) {
    const nodeList = (parent || document).querySelectorAll(
      select
    ) as unknown as Node[]

    nodeList.forEach(node => dom.setMethods(node))

    return Array.from(nodeList)
  },

  /**
   * 创建元素节点
   *
   * @param tagName - 需要创建的标签名称
   * @param [attrs] - 需要添加的节点属性，例如 “src”、“innerHTML” 等属性
   *
   * @returns 返回一个新建的元素节点
   *
   * @example
   * ```
   * // 创建一个 <img src="/test.png" /> 的图片标签
   * const img = dom.create('img', { src: '/test.png' })
   * ```
   */
  create(tagName: string, attrs: Record<string, any> = {}) {
    const node = document.createElement(tagName) as Node
    Object.keys(attrs).forEach(key => {
      node[key] = attrs[key]
    })
    return dom.setMethods(node)
  },

  /**
   * 设置元素节点内联样式
   *
   * @param node - 需要设置style的元素节点
   * @param style - 一个 style 对象，例如 { fontSize: '14px' }
   *
   * @returns 返回传入的 node 元素节点
   *
   * @example
   * ```
   * // 给 body 节点设置 style="font-size:14px;" 内联样式
   * const body = dom.setStyle(dom.query('body'), { fontSize: '14px' })
   * ```
   */
  setStyle(node: Node, style: Record<string, string>) {
    Object.keys(style).forEach(key => {
      node.style[key] = style[key]
    })
    return node
  },

  /**
   * 在元素节点上挂载一些简写方法,方便链式调用
   *
   * @param node - 需要设置简写方法的元素节点
   *
   * @returns 返回已设置简写方法后的元素节点
   *
   * @example
   * ```
   * const body = document.querySelector('body')
   * // 给 body 设置一些简写方法
   * dom.setMethods(body)
   * // 利用设置好的简写方法设置样式等操作
   * body.setStyle({ fontSize: '14px' })
   * ```
   */
  setMethods(node: Node) {
    if (!node) return node

    /** 元素节点的属性操作 */
    node.attr = (key: string, value?: unknown): any => {
      if (value) {
        node.setAttribute(key, value as string)
        return node
      } else {
        return node.getAttribute(key)
      }
    }

    /** 获取元素节点相对于浏览器的信息 */
    node.rect = () => node.getBoundingClientRect()

    /** 添加子节点 */
    node.add = child => {
      node.appendChild(child)
      return node
    }

    /** 销毁当前元素节点 */
    node.destroy = () => {
      node.parentNode?.removeChild(node)
      return node
    }

    /** 创建并添加子元素节点 */
    node.create = function (tagName: string, attrs?: Record<string, any>) {
      const tag = dom.create(tagName, attrs)
      this.add(tag)
      return tag
    }

    /** 设置元素节点样式 */
    node.setStyle = function (style: Record<string, string>) {
      dom.setStyle(this, style)
      return this
    }

    return node
  },
}
