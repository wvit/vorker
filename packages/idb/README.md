## 开箱即用 IndexedDB 增删改查方法

[查看文档](https://wvit.github.io/IDB/)

[查看主页](https://github.com/wvit/IDB)

[下载](https://www.npmjs.com/package/@vorker/idb)

### 使用

新建一个模块文件，初始化 indexedDB

```typescript
// idb.ts
import { Handle, IDB } from '@vorker/idb'

/** 实例化数据库 */
const db = new IDB({
  name: 'indexedDB-name',
  storeNames: ['users'] as const,
  objectNames: ['globalConfig'] as const,
})

/** 生成数据表的操作方法 */
export const { storeHandles, objectHandles } = new Handle({ db })
```

在您要使用的地方导入刚才的 [storeHandles](https://wvit.github.io/IDB/interfaces/StoreHandle.html) 方法

```typescript
// user.ts
import { storeHandles } from './idb.ts'

/** 新建用户 */
const createUser = async () => {
  const status = await storeHandles.users.create({ name: 'test' })
  if (status) console.log('添加成功')
}

/** 删除用户 */
const deleteUser = async (userId: string) => {
  const status = await storeHandles.users.delete(userId)
  if (status) console.log('删除成功')
}

/** 更新用户数据 */
const updateUser = async (userId: string) => {
  const status = await storeHandles.users.update({ id: userId, name: 'hello' })
  if (status) console.log('编辑成功')
}

/** 获取用户列表 */
const getUserList = async () => {
  const { list } = await storeHandles.users.getPage({ pageNo: 1, pageSize: 10 })
  if (list.length) console.log('前10位用户', list)
}
```

亦或您想要存储大量数据，而使用类似 localStorage 的 [objectHandles](https://wvit.github.io/IDB/interfaces/ObjectHandle.html) 方法

```typescript
// globalSetting.ts
import { objectHandles } from './idb.ts'

/** 设置主题颜色 */
const setThemeColor = async () => {
  const status = await objectHandles.globalConfig.set({ themeColor: 'red' })
  if (status) console.log('设置主题色成功')
}

/** 获取主题颜色 */
const getThemeColor = async () => {
  const { themeColor } = await objectHandles.globalConfig.get(['themeColor'])
  if (themeColor) console.log('获取主题色成功', themeColor)
}
```
