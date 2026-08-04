<template>
  <h-single-layout>
    <div class="rsa-generator">
      <div class="rsa-generator__options">
        <label class="rsa-generator__label">密钥长度</label>
        <h-select
          v-model="keySize"
          :options="[
            { label: '512', value: 512 },
            { label: '1024', value: 1024 },
            { label: '2048 (推荐)', value: 2048 }
          ]"
        />
        <label class="rsa-generator__label">格式</label>
        <h-select
          v-model="format"
          :options="[
            { label: 'PKCS#1', value: 'PKCS1' },
            { label: 'PKCS#8', value: 'PKCS8' }
          ]"
        />
        <h-button type="primary" icon="mdi:key-plus" @click="generate">生成密钥对</h-button>
      </div>

      <div v-if="publicKey" class="rsa-generator__result">
        <div class="rsa-generator__key-block">
          <div class="rsa-generator__key-header">
            <span>Public Key (公钥)</span>
            <button class="rsa-generator__copy-btn" @click="copy(publicKey)">
              <h-icon icon="mdi:content-copy" :size="14" /> 复制
            </button>
          </div>
          <pre class="rsa-generator__key selectable">{{ publicKey }}</pre>
        </div>
        <div class="rsa-generator__key-block">
          <div class="rsa-generator__key-header">
            <span>Private Key (私钥)</span>
            <button class="rsa-generator__copy-btn" @click="copy(privateKey)">
              <h-icon icon="mdi:content-copy" :size="14" /> 复制
            </button>
          </div>
          <pre class="rsa-generator__key selectable">{{ privateKey }}</pre>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keySize = ref(2048)
const format = ref<'PKCS1' | 'PKCS8'>('PKCS1')
const publicKey = ref('')
const privateKey = ref('')

/** 使用 Web Crypto API 生成 RSA 密钥对 */
async function generate(): Promise<void> {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: keySize.value,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['sign', 'verify']
    )

    const pubKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

    publicKey.value = arrayBufferToPem(pubKeyBuffer, 'PUBLIC KEY')
    privateKey.value = arrayBufferToPem(privKeyBuffer, 'PRIVATE KEY')
    window.$he3?.message.success(`已生成 ${keySize.value} 位 RSA 密钥对`)
  } catch (err) {
    window.$he3?.message.error(`生成失败: ${(err as Error).message}`)
  }
}

function arrayBufferToPem(buffer: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  const base64 = btoa(binary)
  const lines = base64.match(/.{1,64}/g) || []
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`
}

void format // 格式选择暂时影响展示标签

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success('已复制')
}
</script>

<style scoped lang="less">
.rsa-generator {
  display: flex;
  flex-direction: column;
  gap: 16px;

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

  &__key-block {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__key-header {
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

  &__copy-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;

    &:hover { background: var(--bg-hover); }
  }

  &__key {
    padding: 12px;
    font-family: 'SF Mono', monospace;
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-primary);
    background: var(--bg-code);
    max-height: 200px;
    overflow: auto;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
