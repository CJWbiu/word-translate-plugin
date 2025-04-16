import { ERROR_CODE } from '@/const/error'
import axios from 'axios'

const baseConfig = {
  // baseURL: 'https://localhost:3000/api',
  baseURL: 'https://yiciyuan.net.cn/api',
  timeout: 20000,
}

let ajax = axios.create({ ...baseConfig})

// 用于存储请求的 Map
const pendingRequests = new Map()

let isRefreshing = false
let requestQueue = []
// 缓存 token
let cachedToken = null

// 生成请求的唯一键
function getRequestKey(config) {
  if (!config) return '';

  const { url, method, params, data } = config
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 取消重复请求
function removePendingRequest(config) {
  if (!config) return;

  const requestKey = getRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey)
    controller.abort()
    pendingRequests.delete(requestKey)
  }
}

function formatToken(token) {
  return `Bearer ${token}`
}

// 获取 token 的函数，优先使用缓存
async function getToken() {
  if (cachedToken) return cachedToken
  
  return new Promise((resolve) => {
    const localToken = localStorage.getItem('accessToken')

    if (localToken) {
      cachedToken = localToken
      resolve(cachedToken)
      return;
    }

    chrome.storage.local.get(['accessToken'], (result) => {
      cachedToken = result.accessToken || null
      resolve(cachedToken)
    })
  })
}

function initAjax(adapter) {
  ajax.interceptors.request.use(
    async (config) => {
      // 添加取消控制器
      const controller = new AbortController()
      config.signal = controller.signal

      // 取消重复请求
      removePendingRequest(config)

      // 存储新请求
      pendingRequests.set(getRequestKey(config), controller)

      // 添加 token
      const token = await getToken()
      if (!config.headers.Authorization && token) {
        config.headers.Authorization = formatToken(token)
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  ajax.interceptors.response.use(
    (response) => {
      // 请求完成后，从 pending 中移除
      removePendingRequest(response.config)
      return response.data
    },
    (error) => {
      // 请求完成后，从 pending 中移除
      error.config && removePendingRequest(error.config)

      const response = error.response
      const config = error.config
      const onError = (err) => {
        if (!config.silence) {
          adapter?.onError?.(err.response?.data?.message || '网络异常')
        }

        return Promise.reject(err.response?.data || {
          message: '网络异常',
        })
      }

      if (response?.status === 401 && response.data.code !== ERROR_CODE.LOGIN_TOKEN_EXPIRED) {
        cachedToken = null
        // 重定向到登录页面
        adapter?.routeToAuth?.()
      }
      else if (response?.status === 401 && response.data.code === ERROR_CODE.LOGIN_TOKEN_EXPIRED) {
        cachedToken = null
        // 刷新 token
        if (adapter?.refreshToken && !isRefreshing) {
          isRefreshing = true
          return adapter.refreshToken()
            .then((res) => {
              config.headers.Authorization = formatToken(res.accessToken)
              requestQueue.forEach(cb => cb(res.accessToken))
              requestQueue = []
              isRefreshing = false
              return ajax(config)
            })
            .finally(() => {
              isRefreshing = false
            })
        }
        else {
          return new Promise((resolve) => {
            requestQueue.push((token) => {
              config.headers.Authorization = formatToken(token)
              resolve(ajax(config))
            })
          })
        }
      }

      return onError(error)
    },
  )
}

function resetAjax() {
  ajax = axios.create({ ...baseConfig })
}

export {
  ajax,
  initAjax,
  resetAjax,
}
