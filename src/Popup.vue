<script setup>
import { ref, onMounted } from 'vue';
import { zhCN, dateZhCN } from 'naive-ui'
import Login from './Login.vue';
import Translate from './Translate.vue';
import { initAjax } from './init';

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

  chrome.runtime.sendMessage({
    type: 'ON_LOGIN',
    data: { isLoggedIn: true, ...data }
  });

  isLoggedIn.value = true;
};

// 检查登录状态
onMounted(() => {
  chrome.storage.local.get(['isLoggedIn'], (result) => {
    if (result.isLoggedIn) {
      isLoggedIn.value = true;
    }
  });
});
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" class="container">
    <n-alert v-if="alert.show" :title="alert.title" :type="alert.type" bordered closable />
    
    <!-- 登录表单 -->
    <div v-if="!isLoggedIn">
      <h2 class="subtitle">请先登录</h2>
      <Login @login="onLogin"/>
    </div>
    
    <!-- 翻译界面 -->
    <Translate v-else />
  </n-config-provider>
</template>

<style scoped>
.container {
  padding: 20px;
  background: #fff;
  max-height: 500px;
  width: 400px;

  .subtitle {
    font-size: 14px;
    font-weight: 600;
    padding: 8px 0;
    text-align: center;
  }
}
</style>
