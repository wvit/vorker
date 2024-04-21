import type { IDB } from './idb'

/** 公共操作方法 */
interface CommonHandle {
  /** 监听数据发生变化 */
  onChange: <T extends (changeData: any) => void>(
    callback: T
  ) => {
    id: string
    callback: T
    remove: () => void
  }
}

/** 数据表的操作方法 */
export interface StoreHandle extends CommonHandle {
  /** 添加数据 */
  create: (data: any) => Promise<boolean>
  /** 更新数据 */
  update: (data: UpdateData) => Promise<boolean>

  /** 批量添加数据 */
  batchCreate: <T>(data: T[]) => Promise<T[]>
  /** 批量更新数据 */
  batchUpdate: <T extends UpdateData>(data: T[]) => Promise<T[]>

  /** 删除数据 */
  delete: (id: string) => Promise<boolean>
  /** 批量删除数据 */
  batchDelete: <T extends string>(ids: T[]) => Promise<Record<T, boolean>>
  /** 删除所有数据 */
  deleteAll: () => Promise<boolean>

  /** 获取单条数据详情 */
  getId: (id: string) => Promise<any>
  /** 获取多条数据详情 */
  getIds: (ids: string[]) => Promise<any[]>
  /** 获取查询条件的分页数据 */
  getPage: (query: Query) => Promise<PagingValue>
  /** 获取查询条件的所有数据 */
  getAll: () => Promise<StoreAllValue>
}

/** 数据对象的操作方法 */
export interface ObjectHandle extends CommonHandle {
  /** 获取对象字段值 */
  get: <K extends string | string[]>(key?: K) => Promise<Record<K[number], any>>
  /** 设置对象字段值 */
  set: (data: Record<string, any>) => Promise<boolean>
}

/** 给每个数据表提供的增删改查方法 */
export type StoreHandles<T extends string = string> = Record<T, StoreHandle>

/** 给每个数据对象提供的操作方法 */
export type ObjectHandles<T extends string = string> = Record<T, ObjectHandle>

/** 实例化IDB配置 */
export type IDBOptions<T extends string[], K extends string[]> = {
  /** 数据库名称 */
  name: string
  /** 需要创建的数据表 */
  storeNames?: T
  /** 需要创建的对象存储器 */
  objectNames?: K
}

/** 实例化数据表操作方法参数 */
export type DBHandleOptions<T extends string[], K extends string[]> = {
  /** 数据库实例 */
  db: IDB<T, K>
}

/** 更新数据所需参数 */
export type UpdateData = {
  /** 需要更新数据项 id */
  id: string
  [key: string]: any
}

/** 查询cams */
export type Query = {
  /** 页码 */
  pageNo: number
  /** 分页数量 */
  pageSize: number
  /** 搜索关键字 */
  keyword?: string
}

/** 查询的分页数据结果 */
export type PagingValue<Item = any> = {
  /** 总页数 */
  pages: number
  /** 总数 */
  total: number
  /** 查询到的分页结果 */
  list: Item[]
}

/** 所有数据 */
export type StoreAllValue<Item = any> = {
  /** 总数 */
  total: number
  /** 所有数据 */
  list: Item[]
}

/** 新建数据表 */
export type CreateStoreData = {
  /** 数据表名称 */
  storeName: string
  /** 数据表名称 */
  options?: IDBObjectStoreParameters
  /** 索引配置 */
  indexs?: {
    /** 索引名称 */
    indexName: string
    /** 索引对应字段 */
    fieldName: string | string[]
    /** 其他参数 */
    params?: IDBIndexParameters
  }[]
}

/** 删除数据表 */
export type DeleteStoreData = {
  /** 数据表名称 */
  storeName: string
}

/** 获取分页数据，option入参类型 */
export type GetPageDataOptions = {
  /** 查询条件 */
  query: Query
  /** 索引名称 */
  indexName?: null | string
  /** 数据排序 */
  direction?: IDBCursorDirection
}
