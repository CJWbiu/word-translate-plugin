<script setup lang="ts">
/**
 * @file 单词详情
 */

import Card from '@/components/Card.vue'
import WordExamples from '@/components/WordExamples.vue'
import WordExchange from '@/components/WordExchange.vue'
import WordPhonetic from '@/components/WordPhonetic.vue'
import WordTranslation from '@/components/WordTranslation.vue'
import { computed } from 'vue'

const { info } = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
})

const exchanges = computed(() => info.exchange || [])
</script>

<template>
  <section class="word-detail">
    <Card>
      <WordPhonetic v-if="info.phonetic" :info="info" />
    </Card>

    <Card title="释义">
      <WordTranslation :translations="info.translation" />
      <WordExchange
        v-if="exchanges.length"
        :exchange="exchanges"
      />
    </Card>

    <Card title="例句">
      <WordExamples :info="info" />
    </Card>
  </section>
</template>

<style lang="less" scoped>
.word-detail {
  height: 100%;
}
</style>
