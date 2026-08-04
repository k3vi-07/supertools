<template>
  <h-single-layout>
    <div class="lorem-ipsum">
      <div class="lorem-ipsum__options">
        <label class="lorem-ipsum__label">类型</label>
        <h-select
          v-model="type"
          :options="[
            { label: '段落', value: 'paragraphs' },
            { label: '句子', value: 'sentences' },
            { label: '单词', value: 'words' }
          ]"
        />
        <label class="lorem-ipsum__label">数量</label>
        <h-number-input v-model="count" :min="1" :max="20" />
        <h-checkbox v-model="startWithLorem" label="以 Lorem ipsum 开头" />
      </div>
      <div class="lorem-ipsum__actions">
        <h-button type="primary" icon="mdi:refresh" @click="generate">重新生成</h-button>
        <h-button icon="mdi:content-copy" @click="copy">复制</h-button>
      </div>
      <div class="lorem-ipsum__output">
        <pre class="lorem-ipsum__text selectable">{{ result }}</pre>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const type = ref<'paragraphs' | 'sentences' | 'words'>('paragraphs')
const count = ref(3)
const startWithLorem = ref(true)
const result = ref('')

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function randomSentence(): string {
  const wordCount = 8 + Math.floor(Math.random() * 12)
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(randomWord())
  }
  let sentence = words.join(' ')
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
  return sentence
}

function randomParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4)
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(randomSentence())
  }
  return sentences.join(' ')
}

function generate(): void {
  if (type.value === 'words') {
    const words: string[] = []
    for (let i = 0; i < count.value; i++) words.push(randomWord())
    result.value = startWithLorem.value && count.value >= 2
      ? 'lorem ipsum ' + words.slice(2).join(' ')
      : words.join(' ')
  } else if (type.value === 'sentences') {
    const sentences: string[] = []
    for (let i = 0; i < count.value; i++) sentences.push(randomSentence())
    result.value = sentences.join(' ')
    if (startWithLorem.value) {
      result.value = 'Lorem ipsum dolor sit amet, ' + result.value.charAt(0).toLowerCase() + result.value.slice(1)
    }
  } else {
    const paragraphs: string[] = []
    for (let i = 0; i < count.value; i++) {
      let p = randomParagraph()
      if (i === 0 && startWithLorem.value) {
        p = 'Lorem ipsum dolor sit amet, ' + p.charAt(0).toLowerCase() + p.slice(1)
      }
      paragraphs.push(p)
    }
    result.value = paragraphs.join('\n\n')
  }
}

function copy(): void {
  window.$he3?.copyText(result.value)
  window.$he3?.message.success('已复制')
}

onMounted(() => generate())
</script>

<style scoped lang="less">
.lorem-ipsum {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__options {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__output {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    padding: 16px;
    min-height: 200px;
  }

  &__text {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-primary);
    white-space: pre-wrap;
  }
}
</style>
