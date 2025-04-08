<script lang="ts" setup>
import { defineComponent, ref } from "vue";
import { login } from '@/api/auth'

const emit = defineEmits(['login']);
const formRef = ref(null);
const model = ref({
  email: null,
  password: null,
});
const disabledSubmit = ref(false);

const rules = {
  email: [
    {
      required: true,
      validator(rule, value) {
        if (!value) {
          return new Error("请输入邮箱");
        } 
        
        if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value)) {
          return new Error("请输入有效的邮箱地址");
        }

        return true;
      },
      trigger: ['blur', 'input']
    }
  ],
  password: [
    {
      required: true,
      validator(rule, value) {
        if (!value) {
          return new Error("请输入密码");
        }

        if (!/^(?=.*[A-Z])(?=.*\d)[A-Z\d]{8,}$/i.test(value)) {
          return new Error('请输入8位以上的字母和数字组合，至少包含一个字母和一个数字');
        }

        return true;
      },
      trigger: ['blur', 'input']
    }
  ],
};

function submit() {
  formRef.value.validate((errors) => {
    if (errors) {
      return;
    }

    disabledSubmit.value = true;
    login(model.value).then((res) => {
      emit('login', res.data);
    }).finally(() => {
      disabledSubmit.value = false;
    });
  });
}
</script>

<template>
  <n-form ref="formRef" :model="model" :rules="rules">
    <n-form-item path="email" label="邮箱">
      <n-input v-model:value="model.email" @keydown.enter.prevent />
    </n-form-item>
    <n-form-item path="password" label="密码">
      <n-input
        v-model:value="model.password"
        type="password"
        @keydown.enter.prevent
      />
    </n-form-item>
    <n-row :gutter="[0, 24]">
      <n-col :span="24">
        <div style="display: flex; justify-content: flex-end">
          <n-button
            :disabled="disabledSubmit"
            round
            type="primary"
            @click="submit"
          >
            登录
          </n-button>
        </div>
      </n-col>
    </n-row>
  </n-form>
</template>

<style scoped lang="less">

</style>