<script setup lang="ts">
/**
 * @file 单词发音
 */

const { info } = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="word-phonetic">
    <div class="word-phonetic__phonetic-type">
      美
    </div>
    <div class="word-phonetic__text">
      {{ info.phonetic }}
    </div>
  </div>
</template>

<style scoped lang="less">
.word-phonetic {
  display: inline-flex;
  align-items: center;
  background: #f4f5f7;
  border-radius: 16px;
  color: #666;
  font-size: 14px;
  padding: 4px 12px;
  gap: 6px;
}
</style>
