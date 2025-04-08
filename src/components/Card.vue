<script setup lang="ts">
/**
 * @file 卡片
 */

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="card">
    <div v-if="props.title" class="card__title">
      {{ title }}
    </div>

    <div class="card__content">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
@text-padding: 8px;

.card {
  background: #fff;

  &__title {
    padding: 0 @text-padding;
    border-bottom: 1px dashed #ebedf0;
    line-height: 26px;
    font-size: 14px;
    color: #101214;
  }

  &__content {
    padding: @text-padding;
  }
}

.card + .card {
  margin-top: 10px;
}
</style>
