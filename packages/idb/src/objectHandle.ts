import type { Handle } from './handle'
import type { ObjectHandles } from './interface'

export interface ObjectHandle<T extends string[] = string[]> {
  /** 数据表可操作的方法 */
  objectHandles: ObjectHandles<T[number]>
}

/** 对象类型的数据操作方法 */
export const objectHandle = () => {
  return (DBHandle: typeof Handle) => {
    return class extends DBHandle implements ObjectHandle {
      /** 数据对象操作的方法 */
      get objectHandles() {
        const { objectNames } = this.getDb('options') || {}
        const handles = {} as ObjectHandles

        objectNames?.forEach(name => {
          handles[name] = {
            get: key => this.get(name, key),
            set: data => this.set(name, data),

            onChange: callback => this.onChange(name, callback),
          }
        })

        return handles
      }

      /** 获取属性值 */
      private async get(storeName, key?: string | string[]) {
        const store = await this.getObjectStore(storeName)
        const firstData = await this.getFirstData(store)

        if (typeof key === 'string') {
          return firstData[key]
        } else if (Array.isArray(key)) {
          return Object.keys(key).reduce((prev, item) => {
            return { ...prev, [item]: firstData[item] }
          }, {})
        }

        return firstData || {}
      }

      /** 设置属性值 */
      private async set(storeName, data) {
        const store = await this.getObjectStore(storeName)
        const firstData = await this.getFirstData(store)
        let request = null as unknown as IDBRequest<IDBValidKey>

        if (firstData) {
          request = store.put({ ...firstData, ...data })
        } else {
          request = store.add(this.getCreateData(data))
        }

        return new Promise<boolean>(resolve => {
          request.onsuccess = () => {
            this.runChangeEvents(storeName, {
              action: 'set',
              changeData: data,
            })
            resolve(true)
          }
        })
      }

      /** 对象类型的 handle，主要是围绕数据表中第一项数据进行操作 */
      private async getFirstData(store) {
        return new Promise<any>(resolve => {
          store.getAll().onsuccess = e => {
            const { result } = e.target as IDBRequest
            resolve(result[0])
          }
        })
      }
    } as typeof Handle
  }
}
