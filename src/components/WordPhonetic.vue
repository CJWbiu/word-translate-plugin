<script setup>
/**
 * @file 单词发音
 */
import { getVoice } from '@/api/word'
import { computed, ref } from 'vue'
import { VolumeMediumOutline } from '@vicons/ionicons5'

const { info } = defineProps({
  info: {
    type: Object,
    default: () => ({}),
  },
})

const isPlaying = ref(false)
const iconColor = computed(() => (isPlaying.value ? '#1989fa' : '#666'))

async function playVoice() {
  // 获取音频buffer数据
  const data = await getVoice(info.word)
  // 创建Blob对象
  const blob = new Blob([data], { type: 'audio/mpeg' })
  // 生成可用的URL
  const audioUrl = URL.createObjectURL(blob)

  const audio = new Audio(audioUrl)
  try {
    audio.play()
  }
  catch {
    isPlaying.value = false
  }
  audio.addEventListener('play', () => {
    isPlaying.value = true
  })
  audio.addEventListener('ended', () => {
    isPlaying.value = false
  })
}
</script>

<template>
  <div class="word-phonetic">
    <div class="word-phonetic__phonetic-type">
      美
    </div>
    <div class="word-phonetic__text">
      {{ info.phonetic }}
    </div>

    <n-icon size="18" :component="VolumeMediumOutline" :color="iconColor" @click="playVoice" />
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
