import type { IDBOptions, CreateStoreData, DeleteStoreData } from './interface'

export class IDB<T extends string[], K extends string[]> {
  constructor(options: IDBOptions<T, K>) {
    this.options = options
    this.initDbRequest()
  }

  /** 数据库配置 */
  options = {} as IDBOptions<T, K>

  /** IndexedDB实例 */
  dbRequest?: IDBOpenDBRequest

  /** 当前打开的数据库 */
  dbResult = {} as IDBDatabase

  /** 当前需要创建的数据表 */
  private createStoreData: null | CreateStoreData = null

  /** 当前需要删除的数据表 */
  private deleteStoreData: null | DeleteStoreData = null

  /** 初始化IDBOpenDBRequest */
  private initDbRequest() {
    const { name, storeNames = [], objectNames = [] } = this.options
    this.dbRequest = indexedDB.open(name)

    /** 每次数据库version升级事件 */
    this.dbRequest.onupgradeneeded = e => {
      const { result } = e?.target as IDBOpenDBRequest

      /** 保存打开数据库的结果 */
      this.dbResult = result

      /** 判断当前是否有需要创建的数据表 */
      if (this.createStoreData) {
        const { storeName, options, indexs = [] } = this.createStoreData
        const objectStore = result.createObjectStore(storeName, options)

        indexs.forEach(item => {
          const { indexName, fieldName, params } = item
          /** 创建索引配置，方便后续查询 */
          objectStore.createIndex(indexName, fieldName, params)
        })

        /** 创建完成后，清空当前需要创建的数据表配置 */
        this.createStoreData = null
      }

      /** 判断当前是否有需要删除的数据表 */
      if (this.deleteStoreData) {
        const { storeName } = this.deleteStoreData
        result.deleteObjectStore(storeName)

        /** 删除完成后，清空需要删除的数据表配置 */
        this.deleteStoreData = null
      }
    }

    /** 数据库打开成功事件 */
    this.dbRequest.onsuccess = async e => {
      const { result } = e?.target as IDBOpenDBRequest

      /** 保存打开数据库的结果 */
      this.dbResult = result

      /** 循环创建数据表 */
      for (const item of [...storeNames, ...objectNames]) {
        await this.createObjectStore({
          storeName: item,
          options: { keyPath: 'id' },
        })
      }

      /** 删除数据表 */
      // this.deleteObjectStore({ storeName: 'poiIcons' })
    }
  }

  /** 创建数据表 */
  private createObjectStore = async (storeData: CreateStoreData) => {
    return this.handleObjectStore(result => {
      if (result.objectStoreNames.contains(storeData.storeName)) {
        return false
      }
      this.createStoreData = storeData
      return true
    })
  }

  /** 删除数据表 */
  private deleteObjectStore = async (storeData: DeleteStoreData) => {
    return this.handleObjectStore(result => {
      if (!result.objectStoreNames.contains(storeData.storeName)) {
        return false
      }
      this.deleteStoreData = storeData
      return true
    })
  }

  /** 操作数据库公共逻辑 */
  private handleObjectStore = async (callback: (result: any) => boolean) => {
    return new Promise<void>(resolve => {
      if (this.dbRequest?.readyState === 'done') {
        const { result, onsuccess, onupgradeneeded } = this.dbRequest
        const { name } = this.options
        const { version } = result

        if (callback(result)) {
          /** 升级前需要先关闭数据库连接 */
          this.dbResult.close()
          /** 重新打开并升级数据库版本，使其触发数据库 onupgradeneeded 事件 */
          this.dbRequest = indexedDB.open(name, version + 1)
          /** 在新返回的数据库连接实例上，绑定最初添加的事件 */
          this.dbRequest.onsuccess = onsuccess
          this.dbRequest.onupgradeneeded = onupgradeneeded
        }
      }

      resolve()
    })
  }
}
