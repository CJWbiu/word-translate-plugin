import { initAjax as initBaseAjax } from '@/utils/ajax';
import { refreshToken } from '@/api/auth';

export function initAjax(onError, routeToAuth) {
  initBaseAjax({
    refreshToken: () => {
      return new Promise((resolve) => {
        if (localStorage) {
          const token = localStorage.getItem('refreshToken');

          if (token) {
            return refreshToken(token).then((res) => {
              localStorage.setItem('refreshToken', res.data.refreshToken);
              localStorage.setItem('accessToken', res.data.accessToken);
              resolve(res.data);
            })
          }
        }

        chrome.storage.local.get(['refreshToken'], (result) => {;
          refreshToken(result.refreshToken || '').then((res) => {
            chrome.storage.local.set({ refreshToken: res.data.refreshToken, accessToken: res.data.accessToken });
            resolve(res.data);
          })
        })
      })
    },
    onError,
    routeToAuth
  })
}