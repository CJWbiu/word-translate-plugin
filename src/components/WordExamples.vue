<script setup lang="ts">
/**
 * @file 单词例句
 */

const { info } = defineProps({
  info: {
    type: Object,
    default: () => ({
      examples: [],
      word: '',
    }),
  },
})

function formatEnText(sentence) {
  const escapedWord = info.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 使用单词边界和捕获组
  const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi')
  return sentence.replace(regex, '<span class="highlight">$1</span>')
}
</script>

<template>
  <div class="word-example">
    <div
      v-for="(item, index) in info.examples"
      :key="index"
      class="word-example__item"
    >
      <span class="word-example__item-index">
        {{ index + 1 }}.
      </span>
      <p
        class="word-example__item-en"
        v-html="formatEnText(item.sentence)"
      />
      <p class="word-example__item-zh">
        {{ item.translation }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="less">
.word-example {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__item {
    padding-left: 16px;
    position: relative;

    &-index {
      position: absolute;
      left: 0;
      top: 0;
      color: #a8aaad;
      line-height: 20px;
    }

    /deep/ .highlight {
      color: #f03744;
    }

    &-zh {
      color: #939599;
    }
  }
}
</style>
