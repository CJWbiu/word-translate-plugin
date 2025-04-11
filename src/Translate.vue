<script setup lang="ts">
/**
 * @file 
 */

import { ref, watch, onMounted } from 'vue'
import { getWordDetail, addUserWords } from '@/api/word'
import WordDetail from '@/components/WordDetail.vue'

const emit = defineEmits(['update-position'])
const disabledTranslate = ref(true);
const disabledAdd = ref(true);
const isEmpty = ref(false);
const model = ref({
  text: '',
})
const formRef = ref()
const detail = ref()

const rules = {
  text: [{
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error('请输入单词');
      }

      if (!/^[A-Za-z][A-Za-z\s'-]{0,48}[A-Za-z]$/.test(value) || /'{2,}/.test(value)) {
        return new Error('请输入正确的单词');
      }

      return true;
    },
    trigger: ['blur', 'input']
  }]
}

watch(() => model.value.text, (newVal) => {
  disabledAdd.value = true;

  disabledTranslate.value = !newVal;
})

function onTranslate() {
  formRef.value.validate((errors) => {
    if (!errors) {
      disabledTranslate.value = true;
      disabledAdd.value = true;
      getWordDetail(model.value.text).then((res) => {
        detail.value = res.data
        disabledAdd.value = false;
        isEmpty.value = false;
      }).catch((err) => {
        console.log(err)
        detail.value = null
        disabledAdd.value = true;
        isEmpty.value = true;
      }).finally(() => {
        disabledTranslate.value = false;
        emit('update-position');
      })
    }
  })
}

function onAdd() {
  disabledAdd.value = true;
  addUserWords([{word: model.value.text}]).finally(() => {
    disabledAdd.value = false;
  })
}

onMounted(async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText) {
      model.value.text = clipboardText.trim();
      disabledTranslate.value = !model.value.text;
    }
  } catch (error) {
    console.error('Failed to read clipboard:', error);
  }
});
</script>

<template>
  <div class="wrap">
    <n-form :model="model" :rules="rules" ref="formRef">
      <n-form-item path="text" label="原文">
        <n-input v-model:value="model.text" @keydown.enter.prevent />
      </n-form-item>
    </n-form>

    <div class="detail" v-if="detail">
      <WordDetail :info="detail" />
    </div>

    <n-empty v-else-if="isEmpty" description="为查找到该单词" />

    <n-row :gutter="[0, 24]">
      <n-col :span="12">
        <div style="display: flex; justify-content: flex-start">
          <n-button
            :disabled="disabledAdd"
            round
            @click="onAdd"
          >
            加入单词本
          </n-button>
        </div>
      </n-col>
      <n-col :span="12">
        <div style="display: flex; justify-content: flex-end">
          <n-button
            :disabled="disabledTranslate"
            round
            type="primary"
            @click="onTranslate"
          >
            翻译
          </n-button>
        </div>
      </n-col>
    </n-row>
  </div>
</template>

<style lang="less" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .detail {
    flex: 1;
    max-height: 300px;
    overflow: auto;
  }
}
</style>