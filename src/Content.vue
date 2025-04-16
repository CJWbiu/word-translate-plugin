<script setup>
import { ref, onMounted } from 'vue';
import { zhCN, dateZhCN } from 'naive-ui'
import Login from './Login.vue';
import Translate from './Translate.vue';
import { initAjax } from './init';
import { getPosition } from './utils/position'

// 用户登录状态
const isLoggedIn = ref(false);
const alert = ref({
  show: false,
  title: '',
  type: 'info',
});


initAjax(
  (msg) => {
    alert.value = {
      show: true,
      title: msg,
      type: 'error',
    }
  },
  () => {
    isLoggedIn.value = false;
  },
)

// 登录方法
const onLogin = (data) => {
  const info = { isLoggedIn: true, ...data };
  Object.keys(info).forEach(key => {
    if (key === 'isLoggedIn') {
      localStorage.setItem(key, Number(data[key]));
      return;
    }

    if (key === 'userInfo') {
      localStorage.setItem(key, JSON.stringify(data[key]));
      return;
    }

    localStorage.setItem(key, data[key]);
  })

  chrome.runtime.sendMessage({
    type: 'ON_LOGIN',
    data: info,
  });
  isLoggedIn.value = true;
};

function updatePosition() {
  const el = document.getElementById('word-translate-app');
  
  if (!el) {
    return;
  }

  const { width, height, top, left } = el.getBoundingClientRect();
  const position = getPosition(width, height, top, left);

  el.style.transform = `translate(${position.left}px, ${position.top}px)`;
}

// 检查登录状态
onMounted(() => {
  window.addEventListener('show-msg', (e) => {
    if (!e.detail) {
      return;
    }

    alert.value = {
      show: true,
      ...e.detail,
    };
  })

  const localFlag = localStorage.getItem('isLoggedIn') || 0;
  isLoggedIn.value = Number(localFlag) === 1;
});
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" class="x-yiciyuan-container">
    <n-alert v-if="alert.show" :title="alert.title" :type="alert.type" bordered closable />
    
    <!-- 登录表单 -->
    <div v-if="!isLoggedIn">
      <h2 class="x-yiciyuan-container__subtitle">请先登录</h2>
      <Login @login="onLogin"/>
    </div>
    
    <!-- 翻译界面 -->
    <Translate v-else @update-position="updatePosition" />
  </n-config-provider>
</template>

<style lang="less" scoped>
.x-yiciyuan-container {
  padding: 20px;
  background: #fff;
  max-height: 500px;
  width: 400px;
  color: #1f2225;

  &__subtitle {
    font-size: 14px;
    font-weight: 600;
    padding: 8px 0;
    text-align: center;
  }
}
</style>
