<template>
  <h-single-layout>
    <div class="jwt-parser">
      <div class="jwt-parser__input">
        <h-multiline-input
          v-model="token"
          title="JWT Token"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          :auto-select="true"
        />
      </div>

      <div v-if="parsed" class="jwt-parser__result">
        <h-card-box text="Header (算法信息)" icon="mdi:chevron-up">
          <pre class="jwt-parser__json selectable">{{ parsed.headerFormatted }}</pre>
        </h-card-box>

        <h-card-box text="Payload (载荷数据)" icon="mdi:chevron-down">
          <pre class="jwt-parser__json selectable">{{ parsed.payloadFormatted }}</pre>
          <div v-if="parsed.claims" class="jwt-parser__claims">
            <div v-if="parsed.claims.iss" class="jwt-parser__claim">
              <span class="jwt-parser__claim-label">签发者 (iss):</span>
              <span>{{ parsed.claims.iss }}</span>
            </div>
            <div v-if="parsed.claims.sub" class="jwt-parser__claim">
              <span class="jwt-parser__claim-label">主题 (sub):</span>
              <span>{{ parsed.claims.sub }}</span>
            </div>
            <div v-if="parsed.claims.aud" class="jwt-parser__claim">
              <span class="jwt-parser__claim-label">受众 (aud):</span>
              <span>{{ parsed.claims.aud }}</span>
            </div>
            <div v-if="parsed.claims.exp" class="jwt-parser__claim">
              <span class="jwt-parser__claim-label">过期时间 (exp):</span>
              <span>{{ formatDate(parsed.claims.exp) }}</span>
            </div>
            <div v-if="parsed.claims.iat" class="jwt-parser__claim">
              <span class="jwt-parser__claim-label">签发时间 (iat):</span>
              <span>{{ formatDate(parsed.claims.iat) }}</span>
            </div>
          </div>
        </h-card-box>

        <h-card-box text="Signature (签名)" icon="mdi:fingerprint">
          <code class="jwt-parser__sig selectable">{{ parsed.signature }}</code>
        </h-card-box>
      </div>

      <div v-else-if="error" class="jwt-parser__error">
        <h-icon icon="mdi:alert-circle" :size="24" color="var(--color-error)" />
        <span>{{ error }}</span>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const token = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')

interface JwtClaims {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  iat?: number
  [key: string]: unknown
}

interface ParsedJwt {
  headerFormatted: string
  payloadFormatted: string
  signature: string
  claims?: JwtClaims
}

const parsed = computed<ParsedJwt | null>(() => {
  if (!token.value.trim()) return null
  try {
    const parts = token.value.trim().split('.')
    if (parts.length !== 3) return null

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    return {
      headerFormatted: JSON.stringify(header, null, 2),
      payloadFormatted: JSON.stringify(payload, null, 2),
      signature: parts[2],
      claims: payload as JwtClaims
    }
  } catch (err) {
    return null
  }
})

const error = computed(() => {
  if (!token.value.trim()) return ''
  const parts = token.value.trim().split('.')
  if (parts.length !== 3) return 'JWT 格式错误：需要 3 个由 . 分隔的部分'
  if (!parsed.value) return '无法解析 JWT，请检查格式'
  return ''
})

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return `${date.toLocaleString('zh-CN')} (${timestamp})`
}
</script>

<style scoped lang="less">
.jwt-parser {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__result {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__json {
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__claims {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  &__claim {
    display: flex;
    gap: 8px;
    font-size: 12px;
  }

  &__claim-label {
    color: var(--text-tertiary);
    min-width: 120px;
  }

  &__sig {
    display: block;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    color: var(--text-primary);
    word-break: break-all;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    font-size: 13px;
    color: var(--color-error);
  }
}
</style>
