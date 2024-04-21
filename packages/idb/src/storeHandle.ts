import type { Handle } from './handle'
import type {
  PagingValue,
  StoreAllValue,
  GetPageDataOptions,
  StoreHandles,
} from './interface'

export interface StoreHandle<T extends string[] = string[]> {
  /** 数据表可操作的方法 */
  storeHandles: StoreHandles<T[number]>
}

/** 数据表操作方法 */
export const storeHandle = () => {
  return (DBHandle: typeof Handle) => {
    return class extends DBHandle implements StoreHandle {
      /** 数据表可操作的方法 */
      get storeHandles() {
        const { storeNames } = this.getDb('options') || {}
        const handles = {} as StoreHandles

        storeNames?.forEach(name => {
          handles[name] = {
            create: data => this.createUpdate(name, data),
            update: data => this.createUpdate(name, data),

            batchCreate: data => this.batchCreateUpdate(name, data),
            batchUpdate: data => this.batchCreateUpdate(name, data),

            delete: id => this.delete(name, id),
            batchDelete: ids => this.batchDelete(name, ids),
            deleteAll: () => this.deleteAll(name),

            getId: id => this.getId(name, id),
            getIds: id => this.getIds(name, id),
            getPage: query => this.getPage(name, { query }),
            getAll: () => this.getAll(name),

            onChange: callback => this.onChange(name, callback),
          }
        })

        return handles
      }

      /** 向数据表新增数据，如果数据id存在，就更改数据 */
      private async createUpdate(storeName, data, batchCall?) {
        const store = await this.getObjectStore(storeName)
        const status = await new Promise<boolean>(resolve => {
          const findData = store.get(data.id)

          findData.onerror = () => resolve(false)
          findData.onsuccess = () => {
            let request = null as unknown as IDBRequest<IDBValidKey>

            if (findData.result) {
              request = store.put({ ...findData.result, ...data })
            } else {
              request = store.add(this.getCreateData(data))
            }

            request.onerror = () => resolve(false)
            request.onsuccess = () => {
              if (!batchCall) {
                this.runChangeEvents(storeName, {
                  action: 'createUpdate',
                  changeData: data,
                })
              }
              resolve(true)
            }
          }
        })

        return status
      }

      /** 批量新建或更新数据 */
      private async batchCreateUpdate(storeName, data) {
        const successResults: any[] = []

        for (const item of data) {
          const status = await this.createUpdate(storeName, item, true)
          if (status) successResults.push(item)
        }

        this.runChangeEvents(storeName, {
          action: 'batchCreateUpdate',
          changeData: data,
        })

        return successResults
      }

      /** 删除数据表中的数据 */
      private async delete(storeName, id, batchCall?) {
        const store = await this.getObjectStore(storeName)
        const status = await new Promise<boolean>(resolve => {
          const request = store.delete(id)

          request.onerror = () => resolve(false)
          request.onsuccess = () => {
            if (!batchCall) {
              this.runChangeEvents(storeName, {
                action: 'delete',
                changeData: id,
              })
            }
            resolve(true)
          }
        })

        return status
      }

      /** 批量删除数据 */
      private async batchDelete(storeName, ids) {
        const results = {} as Record<string, boolean>

        for (const item of ids) {
          const status = await this.delete(storeName, item, true)
          results[item] = status
        }

        this.runChangeEvents(storeName, {
          action: 'batchDelate',
          changeData: ids,
        })

        return results
      }

      /** 删除数据表中的所有数据 */
      private async deleteAll(storeName) {
        const store = await this.getObjectStore(storeName)
        const status = await new Promise<boolean>(resolve => {
          const request = store.clear()

          request.onerror = () => resolve(false)
          request.onsuccess = () => resolve(true)
        })

        this.runChangeEvents(storeName, { action: 'deleteAll' })

        return status
      }

      /** 获取单条数据 */
      private async getId(storeName, id) {
        const store = await this.getObjectStore(storeName)
        const detail = await new Promise<any>(resolve => {
          const findData = store.get(id)

          findData.onerror = () => resolve(null)
          findData.onsuccess = () => resolve(findData.result)
        })

        return detail
      }

      /** 获取多条数据 */
      private async getIds(storeName, ids) {
        const results: any[] = []

        for (const item of ids) {
          const result = await this.getId(storeName, item)
          results.push(result)
        }

        return results
      }

      /** 获取所有数据 */
      private async getAll(storeName) {
        const store = await this.getObjectStore(storeName)
        const data: StoreAllValue = { total: 0, list: [] }
        const listData = await new Promise<StoreAllValue>(resolve => {
          const allData = store.getAll()

          allData.onerror = () => resolve(data)
          allData.onsuccess = e => {
            const { result } = e.target as IDBRequest

            data.total = result.length
            data.list = result.sort(
              (a, b) => b.createTimestamp - a.createTimestamp
            )
            resolve(data)
          }
        })

        return listData
      }

      /** 获取分页数据 */
      private async getPage(storeName, options: GetPageDataOptions) {
        const { query, indexName = 'keyword', direction = 'prev' } = options
        const store = await this.getObjectStore(storeName)
        const { pageNo, pageSize, keyword = '' } = query
        const [startPage, endPage] = [
          (pageNo - 1) * pageSize,
          pageNo * pageSize,
        ]
        const pageData = await new Promise<Omit<PagingValue, 'list'>>(
          resolve => {
            const countData = store.count()

            countData.onerror = () => resolve({ pages: 0, total: 0 })
            countData.onsuccess = e => {
              const { result } = e.target as IDBRequest
              resolve({
                pages: Math.ceil(result / pageSize),
                total: result,
              })
            }
          }
        )
        const listData = await new Promise<PagingValue['list']>(resolve => {
          const storeIndex = indexName === null ? store : store.index(indexName)
          /** 分页数据只能通过 游标 的方法获取 */
          const queryCursor = storeIndex.openCursor(null, direction)
          /** 是否已跳过部分记录 */
          let advanced = false
          let index = 0
          let list: any[] = []

          queryCursor.onerror = () => resolve(list)
          queryCursor.onsuccess = e => {
            const { result } = e.target as IDBRequest

            if (!advanced && startPage) {
              advanced = true
              /** 跳过指定数量的记录 */
              result.advance(startPage)
            } else if (index < endPage && result) {
              if (`${result.key}`.indexOf(keyword) !== -1) {
                index++
                list.push(result.value)
              }
              result.continue()
            } else {
              resolve(list)
            }
          }
        })

        return { ...pageData, list: listData }
      }
    } as typeof Handle
  }
}
