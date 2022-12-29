import jquery from 'jquery'
import { Message } from 'element-ui'

export function http(data, errMsg = '请求异常') {
    return new Promise((resolve, reject) => {
        jquery.ajax({
            ...data,
            success: res => {
                resolve(res)
            },
            error: error => {
                Message.error(errMsg)
                reject(error)
            }
        })
    })
}
