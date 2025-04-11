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

function getWordVariantsRegex(baseWord) {
    const lowerWord = baseWord.toLowerCase();
    const variants = new Set();

    const endsWithConsonantY = (word) => {
        if (!word || word.slice(-1) !== 'y') return false;
        if (word.length === 1) return true;
        const prevChar = word.slice(-2, -1).toLowerCase();
        return !['a', 'e', 'i', 'o', 'u'].includes(prevChar);
    };

    const isConsonantY = endsWithConsonantY(lowerWord);

    if (isConsonantY) {
        const stem = lowerWord.slice(0, -1) + 'i';
        variants.add(lowerWord);          // 原词 (query)
        variants.add(lowerWord + 'ing'); // 进行时 (querying)
        variants.add(stem + 'es');       // 复数/第三人称单数 (queries)
        variants.add(stem + 'ed');       // 过去式 (queried)
    } else {
        variants.add(lowerWord);         // 原词
        variants.add(lowerWord + 's');   // 复数/第三人称单数
        variants.add(lowerWord + 'ed');  // 过去式
        variants.add(lowerWord + 'ing'); // 进行时
    }

    // 转义正则特殊字符并按长度排序
    const escaped = Array.from(variants)
        .map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .sort((a, b) => b.length - a.length);

    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

function formatEnText(sentence) {
  const escapedWord = info.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 使用单词边界和捕获组
  const regex = getWordVariantsRegex(escapedWord)
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
