import { ajax } from '@/utils/ajax'

export function getWordDetail(word, config) {
  return ajax.get('/dictionary/query-word', { params: { word }, ...config }).then((res) => {
    const data = res.data
    let examples = []

    try {
      examples = JSON.parse(data.examples)
    }
    catch {
      // do nothing
    }

    return {
      ...res,
      data: {
        ...res.data,
        definition: data.definition?.split('\n') || [],
        translation: data.translation?.split('\n') || [],
        exchange: data.exchange?.split('/') || [],
        examples,
      },
    }
  })
}

export function addUserWords(infos) {
  return ajax.post('/user-dict', infos)
}

export function getVoice(word, lang = 'en') {
  return ajax.get('/dictionary/voice', { params: { word, lang }, responseType: 'arraybuffer' })
}