import { getDate, getId, inspectTimer } from '@vorker/utils'
import { storeHandle } from './storeHandle'
import { objectHandle } from './objectHandle'
import type { DBHandleOptions } from './interface'
import type { StoreHandle } from './storeHandle'
import type { ObjectHandle } from './objectHandle'

export interface Handle<T> extends StoreHandle<T> {}
export interface Handle<T, K> extends ObjectHandle<K> {}

@storeHandle()
@objectHandle()
export class Handle<
  T extends string[] = string[],
  K extends string[] = string[]
> {
  constructor(options: DBHandleOptions<T, K>) {
    this.options = options || {}
  }

  /** 实例化参数 */
  private options = {} as DBHandleOptions<T, K>

  /** 是否已经准备就绪 */
  private ready = false

  /** 监听数据发生改变的事件 */
  private changeEvents = {} as Record<
    (T | K)[number],
    { id: string; callback: (e: any) => any }[]
  >

  /** 监听数据变化 */
  onChange = <F extends (changeData: any) => void>(
    storeName: (T | K)[number],
    callback: F
  ) => {
    const event = { id: getId(), callback }
    const events = this.changeEvents[storeName] || []

    this.changeEvents[storeName] = [...events, event]

    return {
      ...event,
      remove: () => this.removeChangeEvent(storeName, event.id),
    }
  }

  /** 移除 change 事件监听 */
  private removeChangeEvent(storeName: (T | K)[number], id: string) {
    const events = this.changeEvents[storeName] || []
    const findIndex = events.findIndex(item => item.id === id)

    events.splice(findIndex, 1)
  }

  /** 运行已监听的 change 事件 */
  runChangeEvents(
    storeName: (T | K)[number],
    eventData: { action: string; changeData?: any }
  ) {
    const events = this.changeEvents[storeName] || []

    events.forEach(item => {
      const { id, callback } = item
      callback?.({ id, ...eventData })
    })
  }

  /** 新建数据添加公共字段 */
  getCreateData(data: Record<string, any>) {
    const time = Date.now()

    return {
      id: getId(),
      createDate: getDate(time),
      createTimestamp: time,
      ...data,
    }
  }

  /** 获取当前已创建的数据库属性值 */
  getDb<T extends keyof typeof this.options.db>(key: T | T[]) {
    if (typeof key === 'string') {
      return this.options?.db?.[key]
    } else {
      return key.map(this.getDb.bind(this))
    }
  }

  /** 获取数据表对象容器 */
  async getObjectStore(storeName: (T | K)[number]) {
    if (!this.ready) {
      /** 等待检查数据表是否都准备完毕 */
      await inspectTimer(() => {
        const [options, dbResult] = this.getDb(['options', 'dbResult'])
        const { storeNames = [], objectNames = [] } = options || {}
        const nameLength = storeNames.length + objectNames.length

        return nameLength === dbResult?.objectStoreNames?.length
      })

      /** 等待检查是否没有正在进行中的事务 */
      await inspectTimer(() => {
        return !this.getDb('dbRequest')?.transaction?.mode
      })
    }

    this.ready = true

    return this.getDb('dbResult')
      .transaction([storeName], 'readwrite')
      .objectStore(storeName) as IDBObjectStore
  }
}
