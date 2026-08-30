<template>
  <h-single-layout>
    <div class="aes-encryption">
      <div class="aes-encryption__options">
        <label class="aes-encryption__label">模式</label>
        <h-select
          v-model="mode"
          :options="[
            { label: 'CBC', value: 'CBC' },
            { label: 'ECB', value: 'ECB' }
          ]"
        />
        <label class="aes-encryption__label">密钥长度</label>
        <h-select
          v-model="keySize"
          :options="[
            { label: '128', value: 128 },
            { label: '192', value: 192 },
            { label: '256', value: 256 }
          ]"
        />
        <label class="aes-encryption__label">输出编码</label>
        <h-select
          v-model="outputEncoding"
          :options="[
            { label: 'Base64', value: 'Base64' },
            { label: 'Hex', value: 'Hex' }
          ]"
        />
      </div>

      <div class="aes-encryption__field">
        <label class="aes-encryption__label">密钥 (Key)</label>
        <h-input v-model="key" placeholder="输入密钥..." />
      </div>

      <div v-if="mode === 'CBC'" class="aes-encryption__field">
        <label class="aes-encryption__label">IV (初始向量)</label>
        <h-input v-model="iv" placeholder="输入 IV..." />
      </div>

      <h-text-transform
        :sample-data="sampleText"
        enable-reverse
        forward-label="加密"
        reverse-label="解密"
        forward-input-title="明文"
        forward-output-title="密文"
        reverse-input-title="密文"
        reverse-output-title="明文"
        :transform="encrypt"
        :reverse-transform="decrypt"
        :refresh-key="[mode, keySize, outputEncoding, key, iv]"
      />
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

const mode = ref<'CBC' | 'ECB'>('CBC')
const keySize = ref<number>(256)
const outputEncoding = ref<'Base64' | 'Hex'>('Base64')
const key = ref('1234567890abcdef1234567890abcdef')
const iv = ref('1234567890123456')
const sampleText = 'Hello SuperTools! AES 加解密测试。'

function getParameters(): { enc: typeof CryptoJS.enc.Base64; keyParsed: CryptoJS.lib.WordArray; options: Record<string, unknown> } {
  const requiredKeyBytes = keySize.value / 8
  const actualKeyBytes = new TextEncoder().encode(key.value).length
  if (actualKeyBytes !== requiredKeyBytes) throw new Error(`密钥必须正好是 ${requiredKeyBytes} 字节，当前为 ${actualKeyBytes} 字节`)
  if (mode.value === 'CBC') {
    const actualIvBytes = new TextEncoder().encode(iv.value).length
    if (actualIvBytes !== 16) throw new Error(`CBC 的 IV 必须正好是 16 字节，当前为 ${actualIvBytes} 字节`)
  }
  const options: Record<string, unknown> = {
    mode: mode.value === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }
  if (mode.value === 'CBC') options.iv = CryptoJS.enc.Utf8.parse(iv.value)
  return {
    enc: outputEncoding.value === 'Base64' ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex,
    keyParsed: CryptoJS.enc.Utf8.parse(key.value),
    options
  }
}

function encrypt(input: string): string {
  const { enc, keyParsed, options } = getParameters()
  const encrypted = CryptoJS.AES.encrypt(input, keyParsed, options as never)
  return encrypted.ciphertext.toString(enc)
}

function decrypt(input: string): string {
  const { enc, keyParsed, options } = getParameters()
  const normalized = input.trim()
  if (!normalized) return ''
  if (outputEncoding.value === 'Hex' && (!/^[0-9a-f]+$/i.test(normalized) || normalized.length % 2 !== 0)) {
    throw new Error('密文不是有效的 Hex')
  }
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: enc.parse(normalized) })
  const decrypted = CryptoJS.AES.decrypt(cipherParams, keyParsed, options as never)
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8)
  if (!plaintext) throw new Error('解密失败，请检查密钥、IV、模式和密文编码')
  return plaintext
}
</script>

<style scoped lang="less">
.aes-encryption {
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

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
