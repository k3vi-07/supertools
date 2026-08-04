<template>
  <h-single-layout>
    <div class="text-diff">
      <div class="text-diff__panels">
        <div class="text-diff__panel">
          <label class="text-diff__label">原始文本</label>
          <textarea v-model="text1" class="text-diff__textarea selectable" spellcheck="false" />
        </div>
        <div class="text-diff__panel">
          <label class="text-diff__label">修改后文本</label>
          <textarea v-model="text2" class="text-diff__textarea selectable" spellcheck="false" />
        </div>
      </div>

      <div class="text-diff__result">
        <div class="text-diff__result-header">
          <span>差异对比</span>
          <div class="text-diff__legend">
            <span class="text-diff__legend-item added">+ 新增 ({{ stats.added }})</span>
            <span class="text-diff__legend-item removed">- 删除 ({{ stats.removed }})</span>
          </div>
        </div>
        <div class="text-diff__lines">
          <div v-for="(line, i) in diffLines" :key="i" class="text-diff__line" :class="line.type">
            <span class="text-diff__line-marker">{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}</span>
            <span class="text-diff__line-text selectable">{{ line.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const text1 = ref('Hello World\nThis is line 2\nThis is line 3\nGoodbye')
const text2 = ref('Hello World\nThis is modified line 2\nThis is line 3\nNew line 4\nGoodbye')

interface DiffLine {
  type: 'added' | 'removed' | 'same'
  text: string
}

const diffLines = computed<DiffLine[]>(() => {
  const lines1 = text1.value.split('\n')
  const lines2 = text2.value.split('\n')
  const result: DiffLine[] = []

  // 简单的逐行 LCS diff
  const dp: number[][] = Array(lines1.length + 1)
    .fill(0)
    .map(() => Array(lines2.length + 1).fill(0))

  for (let i = 1; i <= lines1.length; i++) {
    for (let j = 1; j <= lines2.length; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  let i = lines1.length, j = lines2.length
  const temp: DiffLine[] = []
  while (i > 0 && j > 0) {
    if (lines1[i - 1] === lines2[j - 1]) {
      temp.unshift({ type: 'same', text: lines1[i - 1] })
      i--; j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      temp.unshift({ type: 'removed', text: lines1[i - 1] })
      i--
    } else {
      temp.unshift({ type: 'added', text: lines2[j - 1] })
      j--
    }
  }
  while (i > 0) {
    temp.unshift({ type: 'removed', text: lines1[i - 1] })
    i--
  }
  while (j > 0) {
    temp.unshift({ type: 'added', text: lines2[j - 1] })
    j--
  }

  return temp
})

const stats = computed(() => ({
  added: diffLines.value.filter((l) => l.type === 'added').length,
  removed: diffLines.value.filter((l) => l.type === 'removed').length
}))
</script>

<style scoped lang="less">
.text-diff {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__panels {
    display: flex;
    gap: 12px;
  }

  &__panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__textarea {
    height: 120px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    resize: vertical;
    outline: none;

    &:focus {
      border-color: var(--color-primary);
    }
  }

  &__result {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__legend {
    display: flex;
    gap: 12px;
    font-weight: normal;
  }

  &__legend-item {
    &.added { color: var(--color-success); }
    &.removed { color: var(--color-error); }
  }

  &__lines {
    max-height: 300px;
    overflow-y: auto;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
  }

  &__line {
    display: flex;
    padding: 1px 8px;

    &.added {
      background: color-mix(in srgb, var(--color-success) 15%, transparent);
    }
    &.removed {
      background: color-mix(in srgb, var(--color-error) 15%, transparent);
    }
  }

  &__line-marker {
    width: 16px;
    flex-shrink: 0;
    color: var(--text-tertiary);
  }
}
</style>
