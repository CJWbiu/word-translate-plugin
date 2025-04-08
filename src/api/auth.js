import { ajax } from '@/utils/ajax'

export function login(params) {
  return ajax.post('/user/login', params)
}

export function refreshToken(refreshToken) {
  return ajax.get('/user/refresh', {
    params: { refreshToken },
  })
}