import { dom } from './dom'

/**
 * 将文件转为 base64
 *
 * @param file - 需要获取内容的文件
 * @param type - 需要将文件转为什么类型的内容。默认为 "base64"
 *
 * @returns 返回内容
 *
 * @example
 * ```
 * // 获取一个图片的 blob
 * const imgBlob = await fetch('/test.png').then(res => res.blob())
 * // 获取 json 文件的 blob
 * const jsonBlob = await fetch('/test.json').then(res => res.blob())
 * 
 * // 获取图片的base64
 * const imgBase64 = await getBase64(imgBlob)
 * // 获取 json 文件内容
 * const jsonContent = await getBase64(jsonBlob, 'text')
 * ```
 */
export const getFileData = (
  file: Blob,
  type?: 'text' | 'base64'
): Promise<string> => {
  const reader = new FileReader()

  return new Promise(resolve => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => resolve('')

    if (type === 'text') {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}

/**
 * 下载文本内容
 *
 * @param content - 需要下载的内容
 * @param fileName - 下载的文件名
 * @param [type] - MIME 类型值。默认为 'application/json'
 *
 * @example
 * ```
 * // 将 "{ a: 1}" 保存名为 "test.json" 的文件
 * downloadContent('{ a: 1 }', 'test.json')
 * ```
 */
export const downloadContent = (
  content: string,
  fileName: string,
  type?: 'application/json' | 'text/plain' | string
) => {
  const blob = new Blob([content], { type: type || 'application/json' })
  const url = URL.createObjectURL(blob)

  dom.create('a', { download: fileName, href: url }).click()
  URL.revokeObjectURL(url)
}

/**
 * 调出上传文件弹窗
 *
 * @param [options.accept] - 允许上传的文件类型
 * @param [options.maxSize] - 允许上传文件的最大体积。单位为 KB
 *
 * @returns 返回一个包含上传文件和状态的对象
 *
 * @example
 * ```
 * // 上传一个 500KB 以内的 json 文件
 * const result = await uploadFile({ accept: '.json', maxSize: 500 })
 * ```
 */
export const uploadFile = (options?: {
  accept?: string
  maxSize?: number
}): Promise<{
  status: 'success' | 'maxSizeExceed' | 'cancel'
  file?: Blob
}> => {
  const { accept, maxSize = 0 } = options || {}
  const input = dom.create('input', { type: 'file', accept })

  return new Promise(reslove => {
    input.onchange = (e: any) => {
      const file = e.target.files[0]

      input.remove()

      reslove({
        file,
        status: file.size > maxSize ? 'success' : 'maxSizeExceed',
      })
    }

    input.oncancel = () => {
      reslove({ status: 'cancel' })
    }

    input.click()
  })
}
