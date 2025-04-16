import { createApp } from 'vue'
import TranslateLayer from './Content.vue'
import { resetAjax } from './utils/ajax'
import { getPosition } from './utils/position'

let unmount = null;
let popup = null;
let button = null;
const DragElID = 'x-yiciyuan-drag-bar';

const supportDrag = (mountEl) => {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let startLeft = 0;
  let startTop = 0;
  let currentX = 0;
  let currentY = 0;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const { width, height } = mountEl.getBoundingClientRect();

  // 鼠标按下事件
  mountEl.addEventListener('mousedown', (e) => {
    if (e.target.id !== DragElID) return;

    isDragging = true;
    // 记录初始位置
    const rect = mountEl.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    offsetX = e.clientX - startLeft;
    offsetY = e.clientY - startTop;
    mountEl.style.opacity = '0.9';
    // 禁用过渡动画，拖拽时立即响应
    mountEl.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // 计算新的位置
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // 边界限制
    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - width));
    newTop = Math.max(0, Math.min(newTop, viewportHeight - height));

    currentX = newLeft;
    currentY = newTop;

    // 使用 transform 实现拖拽
    mountEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      mountEl.style.opacity = '1';
      // 拖拽结束后保留最终位置
      mountEl.style.transition = '';
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
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    background: #fff;
    box-shadow: 0 0 3px 1px #ddd;
    transform: translate(${left}px, ${top}px);`;
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
  barEl.id = DragElID;

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