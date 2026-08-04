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

      <div class="aes-encryption__actions">
        <h-radio
          v-model="action"
          :options="[
            { label: '加密', value: 'encrypt' },
            { label: '解密', value: 'decrypt' }
          ]"
          size="small"
        />
      </div>

      <h-text-transform
        :sample-data="sampleText"
        :transform="processFn"
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
const key = ref('my-secret-key-123')
const iv = ref('1234567890123456')
const action = ref<'encrypt' | 'decrypt'>('encrypt')
const sampleText = 'Hello SuperTools! AES 加解密测试。'

function processFn(input: string): string {
  if (!input || !key.value) return ''
  try {
    const enc = outputEncoding.value === 'Base64' ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex
    const keyParsed = CryptoJS.enc.Utf8.parse(key.value)

    if (action.value === 'encrypt') {
      const options: Record<string, unknown> = {
        mode: mode.value === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        keySize: keySize.value / 32
      }
      if (mode.value === 'CBC') {
        options.iv = CryptoJS.enc.Utf8.parse(iv.value)
      }
      const encrypted = CryptoJS.AES.encrypt(input, keyParsed, options as never)
      return encrypted.ciphertext.toString(enc)
    } else {
      const options: Record<string, unknown> = {
        mode: mode.value === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
      if (mode.value === 'CBC') {
        options.iv = CryptoJS.enc.Utf8.parse(iv.value)
      }
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: enc.parse(input)
      })
      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyParsed, options as never)
      return decrypted.toString(CryptoJS.enc.Utf8)
    }
  } catch (err) {
    return `❌ ${(err as Error).message}`
  }
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
