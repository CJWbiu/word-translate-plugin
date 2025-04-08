import { createApp } from 'vue'
import TranslateLayer from './Content.vue'
import { resetAjax } from './utils/ajax'

let unmount = null;
let popup = null;
let button = null;

// 创建挂载点并添加到页面
const createMountPoint = (rect) => {
  const mountEl = document.createElement('div');
  mountEl.id = 'word-translate-app';
  mountEl.style.position = 'absolute';
  mountEl.style.top = `${rect.top + window.scrollY}px`;
  mountEl.style.left = `${rect.left + window.scrollX}px`;
  mountEl.style.zIndex = 9999;
  mountEl.style.width = '400px';
  mountEl.style.maxHeight = '500px';
  mountEl.style.background = '#fff';
  mountEl.style.boxShadow = '0 0 3px 1px #ddd';
  document.body.appendChild(mountEl);
  return mountEl;
};

// 初始化Vue应用
const initVueApp = (selectedText, rect) => {
  resetAjax();

  if (selectedText) {
    const mountPoint = createMountPoint(rect);
    let app = createApp(TranslateLayer);
    popup = app.mount(mountPoint);

    return () => {
      app.unmount();
      mountPoint.remove();
      popup = null;
      app = null;
    };
  }

  return () => {};
};

const createTranslateButton = () => {
  const button = document.createElement('div');
  button.id = 'word-translate-button';
  button.textContent = '翻译';
  button.style.cssText = `
    position: fixed;
    background-color: #4285f4;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    z-index: 9999;
    display: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  `;
  document.body.appendChild(button);
  return button;
};

const asyncStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isLoggedIn', 'accessToken', 'refreshToken', 'userInfo'], (result) => {
      Object.keys(result).forEach((key) => {
        if (key === 'userInfo') {
          localStorage.setItem(key, JSON.stringify(result[key]));
        } else if (key === 'isLoggedIn') {
          localStorage.setItem(key, Number(result[key]));
        } else {
          localStorage.setItem(key, result[key]);
        }
      });

      resolve();
    })
  })
}

function init() {
  button = button || createTranslateButton();

  document.addEventListener('mouseup', async (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      // 显示翻译按钮在鼠标位置
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      button.style.left = `${rect.right}px`;
      button.style.top = `${rect.top - 30}px`;
      button.style.display = 'block';
      
      // 点击翻译按钮
      button.onclick = async () => {
        try {
          // 将选中文本写入剪贴板
          await navigator.clipboard.writeText(selectedText);
        } catch (error) {
          console.error('Failed to copy text:', error);
        }

        button.style.display = 'none';
        asyncStorage().then(() => {
          unmount = initVueApp(selectedText, rect);
        })
      };
    } else {
      button.style.display = 'none';
    }
  })

  document.addEventListener('mousedown', (e) => {
    if (!popup) return;

    if (e.target !== button && e.target !== popup.$el && !popup.$el.contains(e.target)) {
      button.style.display = 'none';
      unmount();
    }
  });
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    console.log('page loaded, start init');
    init();
  }
}