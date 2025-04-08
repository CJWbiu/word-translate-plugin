<script setup lang="ts">
/**
 * @file 单词翻译
 */

const { translations } = defineProps({
  translations: {
    type: Array,
    default: () => ([]),
  },
})
</script>

<template>
  <div class="translation">
    <div
      v-for="(text, index) in translations"
      :key="index"
      class="translation__line"
    >
      {{ text }}
    </div>
  </div>
</template>

<style scoped lang="less">
.translation {
  padding: 4px 0;

  &__line {
    text-align: left;
  }
}
</style>
