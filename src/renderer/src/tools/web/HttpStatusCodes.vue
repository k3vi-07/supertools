<template>
  <h-single-layout>
    <div class="http-status">
      <div class="http-status__search">
        <h-input v-model="search" placeholder="搜索状态码或关键词..." />
      </div>
      <div class="http-status__groups">
        <div v-for="group in filteredGroups" :key="group.range" class="http-status__group">
          <div class="http-status__group-header" :style="{ color: group.color }">
            {{ group.range }} - {{ group.title }}
          </div>
          <div class="http-status__codes">
            <div
              v-for="code in group.codes"
              :key="code.code"
              class="http-status__code"
              :style="{ borderLeftColor: group.color }"
            >
              <span class="http-status__code-number" :style="{ color: group.color }">{{ code.code }}</span>
              <div class="http-status__code-info">
                <div class="http-status__code-name">{{ code.name }}</div>
                <div class="http-status__code-desc">{{ code.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')

interface StatusCode {
  code: number
  name: string
  desc: string
}

interface StatusGroup {
  range: string
  title: string
  color: string
  codes: StatusCode[]
}

const groups: StatusGroup[] = [
  {
    range: '1xx',
    title: '信息响应',
    color: '#3b82f6',
    codes: [
      { code: 100, name: 'Continue', desc: '继续发送请求的剩余部分' },
      { code: 101, name: 'Switching Protocols', desc: '切换协议，如升级到 WebSocket' },
      { code: 102, name: 'Processing', desc: '服务器正在处理请求' }
    ]
  },
  {
    range: '2xx',
    title: '成功响应',
    color: '#22c55e',
    codes: [
      { code: 200, name: 'OK', desc: '请求成功' },
      { code: 201, name: 'Created', desc: '资源创建成功' },
      { code: 202, name: 'Accepted', desc: '请求已接受，待处理' },
      { code: 204, name: 'No Content', desc: '成功但无内容返回' },
      { code: 206, name: 'Partial Content', desc: '部分内容（范围请求）' }
    ]
  },
  {
    range: '3xx',
    title: '重定向',
    color: '#f59e0b',
    codes: [
      { code: 301, name: 'Moved Permanently', desc: '永久重定向' },
      { code: 302, name: 'Found', desc: '临时重定向' },
      { code: 304, name: 'Not Modified', desc: '资源未修改，使用缓存' },
      { code: 307, name: 'Temporary Redirect', desc: '临时重定向（保持方法）' },
      { code: 308, name: 'Permanent Redirect', desc: '永久重定向（保持方法）' }
    ]
  },
  {
    range: '4xx',
    title: '客户端错误',
    color: '#ef4444',
    codes: [
      { code: 400, name: 'Bad Request', desc: '请求语法错误' },
      { code: 401, name: 'Unauthorized', desc: '未认证' },
      { code: 403, name: 'Forbidden', desc: '服务器拒绝请求' },
      { code: 404, name: 'Not Found', desc: '资源未找到' },
      { code: 405, name: 'Method Not Allowed', desc: '方法不被允许' },
      { code: 408, name: 'Request Timeout', desc: '请求超时' },
      { code: 409, name: 'Conflict', desc: '请求冲突' },
      { code: 413, name: 'Payload Too Large', desc: '请求体过大' },
      { code: 429, name: 'Too Many Requests', desc: '请求过多（限流）' }
    ]
  },
  {
    range: '5xx',
    title: '服务端错误',
    color: '#dc2626',
    codes: [
      { code: 500, name: 'Internal Server Error', desc: '服务器内部错误' },
      { code: 501, name: 'Not Implemented', desc: '服务器不支持此功能' },
      { code: 502, name: 'Bad Gateway', desc: '网关错误' },
      { code: 503, name: 'Service Unavailable', desc: '服务不可用' },
      { code: 504, name: 'Gateway Timeout', desc: '网关超时' }
    ]
  }
]

const filteredGroups = computed(() => {
  if (!search.value.trim()) return groups
  const q = search.value.toLowerCase()
  return groups
    .map((group) => ({
      ...group,
      codes: group.codes.filter(
        (c) =>
          c.code.toString().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q)
      )
    }))
    .filter((g) => g.codes.length > 0)
})
</script>

<style scoped lang="less">
.http-status {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__search {
    .h-input, input {
      width: 100%;
    }
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__group-header {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  &__codes {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__code {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-left: 3px solid;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
  }

  &__code-number {
    font-family: 'SF Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    min-width: 48px;
  }

  &__code-info {
    flex: 1;
  }

  &__code-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__code-desc {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
}
</style>
