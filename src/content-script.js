import { createApp } from 'vue'
import TranslateLayer from './Content.vue'
import { resetAjax } from './utils/ajax'
import { getPosition } from './utils/position'

let unmount = null;
let popup = null;
let button = null;

const supportDrag = (mountEl) => {
  // 拖拽功能实现
  let isDragging = false; // 标记是否正在拖拽
  let offsetX = 0; // 鼠标按下时相对于元素左上角的偏移量
  let offsetY = 0;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const { width, height } = mountEl.getBoundingClientRect();

  // 鼠标按下事件
  mountEl.addEventListener('mousedown', (e) => {
    if (e.target.id!== 'word-translate-bar') return;

    isDragging = true;
    offsetX = e.clientX - mountEl.offsetLeft; // 计算水平偏移量
    offsetY = e.clientY - mountEl.offsetTop; // 计算垂直偏移量
    mountEl.style.opacity = '0.8'; // 拖拽时降低透明度以提示用户
  });

  // 鼠标移动事件
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || e.target.id !== 'word-translate-bar') return;

    // 计算新的位置
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // 边界限制（确保元素不超出视口范围）
    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - width));
    newTop = Math.max(0, Math.min(newTop, viewportHeight - height));

    // 更新元素位置
    mountEl.style.left = `${newLeft}px`;
    mountEl.style.top = `${newTop}px`;
  });

  // 鼠标松开事件
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      mountEl.style.opacity = '1'; // 恢复透明度
    }
  });
}

// 创建挂载点并添加到页面
const createMountPoint = (rect) => {
  const width = 440;

  const {left, top} = getPosition(width, 160, rect.top, rect.left);

  // 创建并设置 mountEl 的样式
  const mountEl = document.createElement('div');
  mountEl.style.width = `${width}px`;
  mountEl.style.maxHeight = '500px';

  const wrapEl = document.createElement('div');
  wrapEl.id = 'word-translate-app';
  wrapEl.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    z-index: 9999;
    background: #fff;
    box-shadow: 0 0 3px 1px #ddd;`;
  const barEl = document.createElement('div');
  barEl.style.cssText = `
    width: 100%;
    height: 18px;
    text-align: center;
    line-height: 18px;
    color: #999;
    font-size: 10px;
    cursor: move;
    border-bottom: 1px solid #ddd;`;
  barEl.innerText = '•••';
  barEl.id = 'word-translate-bar';

  wrapEl.appendChild(barEl);
  wrapEl.appendChild(mountEl);
  // 将 mountEl 添加到 body 中
  document.body.appendChild(wrapEl);

  supportDrag(wrapEl);

  return {wrapEl, mountEl};
};

// 初始化Vue应用
const initVueApp = (selectedText, rect) => {
  resetAjax();

  if (selectedText) {
    const {wrapEl, mountEl: mountPoint} = createMountPoint(rect);
    let app = createApp(TranslateLayer);
    app.mount(mountPoint);
    popup = wrapEl;

    return () => {
      app.unmount();
      popup.remove();
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

    if (e.target !== button && e.target !== popup && !popup.contains(e.target)) {
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