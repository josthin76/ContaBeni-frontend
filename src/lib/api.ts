/// <reference types="vite/client" />
import axios from 'axios'
import { toast } from 'sonner'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'https://contabily-xcw1.onrender.com/api/v1').replace(/\/+$/, '')

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let coldStartToastId: string | number | null = null
let pendingRequestsCount = 0
let coldStartTimer: ReturnType<typeof setTimeout> | null = null

const onRequestStart = () => {
  pendingRequestsCount++
  if (pendingRequestsCount === 1) {
    coldStartTimer = setTimeout(() => {
      coldStartToastId = toast.loading(
        'El servidor en Render se está reactivando (Cold Start). Por favor espera unos segundos...',
        { id: 'render-cold-start', duration: 60000 }
      )
    }, 4500)
  }
}

const onRequestEnd = () => {
  pendingRequestsCount = Math.max(0, pendingRequestsCount - 1)
  if (pendingRequestsCount === 0) {
    if (coldStartTimer) {
      clearTimeout(coldStartTimer)
      coldStartTimer = null
    }
    if (coldStartToastId) {
      toast.dismiss('render-cold-start')
      coldStartToastId = null
    }
  }
}

api.interceptors.request.use(
  (config) => {
    onRequestStart()
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const empresaId = localStorage.getItem('empresaId')
    if (empresaId) {
      config.headers['x-empresa-id'] = empresaId
      config.headers['empresa-id'] = empresaId
    }
    return config
  },
  (error) => {
    onRequestEnd()
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => {
    onRequestEnd()
    return res
  },
  async (error) => {
    onRequestEnd()
    const originalRequest = error.config
    const url = originalRequest?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          const newAccessToken = res.data?.tokens?.accessToken ?? res.data?.accessToken
          const newRefreshToken = res.data?.tokens?.refreshToken ?? res.data?.refreshToken

          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken)
            if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken)
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
            processQueue(null, newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          localStorage.removeItem('empresaId')
          localStorage.removeItem('empresa')
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login'
          }
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      } else {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('empresaId')
        localStorage.removeItem('empresa')
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)
