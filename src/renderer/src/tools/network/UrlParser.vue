<template>
  <h-single-layout>
    <div class="url-parser">
      <div class="url-parser__input">
        <label>URL</label>
        <h-input v-model="url" placeholder="https://user:pass@example.com:8080/path?q=1#hash" />
      </div>
      <h-card-box text="解析结果" icon="mdi:link-variant">
        <div v-if="parsed" class="url-parser__result">
          <div v-for="field in fields" :key="field.key" class="url-parser__row">
            <span>{{ field.label }}</span>
            <code class="selectable">{{ parsed[field.key] || '—' }}</code>
            <button v-if="parsed[field.key]" class="url-parser__copy" @click="copy(parsed[field.key])">
              <h-icon icon="mdi:content-copy" :size="12" />
            </button>
          </div>
          <div v-if="parsed.params" class="url-parser__params">
            <div class="url-parser__params-title">查询参数</div>
            <div v-for="[k, v] in Object.entries(parsed.params)" :key="k" class="url-parser__param">
              <code>{{ k }}</code> = <code class="selectable">{{ v }}</code>
            </div>
          </div>
        </div>
      </h-card-box>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const url = ref('https://admin:secret@supertools.app:8443/api/v1/tools?category=json&limit=10#results')

const fields = [
  { key: 'protocol', label: '协议' },
  { key: 'username', label: '用户名' },
  { key: 'password', label: '密码' },
  { key: 'hostname', label: '主机名' },
  { key: 'port', label: '端口' },
  { key: 'pathname', label: '路径' },
  { key: 'search', label: '查询字符串' },
  { key: 'hash', label: '锚点' },
  { key: 'origin', label: 'Origin' }
]

const parsed = computed(() => {
  try {
    const u = new URL(url.value)
    const params: Record<string, string> = {}
    u.searchParams.forEach((v, k) => { params[k] = v })
    return {
      protocol: u.protocol,
      username: u.username,
      password: u.password,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      origin: u.origin,
      params
    }
  } catch {
    return null
  }
})

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.url-parser {
  display: flex; flex-direction: column; gap: 16px;
  &__input { display: flex; flex-direction: column; gap: 6px; label { font-size: 12px; color: var(--text-secondary); } input { width: 100%; } }
  &__result { display: flex; flex-direction: column; gap: 6px; }
  &__row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-color-light);
    span { font-size: 12px; color: var(--text-tertiary); min-width: 80px; }
    code { flex: 1; font-family: monospace; font-size: 12px; color: var(--color-primary); word-break: break-all; }
  }
  &__copy { border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; padding: 2px; &:hover { color: var(--text-primary); } }
  &__params { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color); }
  &__params-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
  &__param { padding: 4px 0; font-size: 12px;
    code { font-family: monospace; color: var(--color-primary); }
  }
}
</style>
