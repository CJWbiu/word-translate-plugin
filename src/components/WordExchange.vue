<script setup lang="ts">
/**
 * @file 单词变形
 */

import { computed } from 'vue'

const { exchange } = defineProps({
  exchange: {
    type: Array,
    default: () => ([]),
  },
})

const list = computed(() => {
  return exchange.map((item) => {
    const [type, ...words] = item.split(' ')
    return {
      type,
      word: words.join(' '),
    }
  })
})
</script>

<template>
  <div class="word-exchange">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="word-exchange__item"
    >
      <span class="word-exchange__item-left"> {{ item.type }} </span>
      <span class="word-exchange__item-right">
        {{ item.word }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="less">
.word-exchange {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  &__item {
    display: flex;
    align-items: center;
    margin-right: 18px;

    &-left {
      font-size: 12px;
      margin-right: 12px;
      color: #939599;
    }

    &-right {
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
