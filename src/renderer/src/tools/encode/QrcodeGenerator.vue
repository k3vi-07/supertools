<template>
  <h-single-layout>
    <div class="qrcode-generator">
      <div class="qrcode-generator__input">
        <h-input
          v-model="text"
          placeholder="输入文本或 URL..."
          class="qrcode-generator__field"
        />
        <div class="qrcode-generator__options">
          <label class="qrcode-generator__label">尺寸</label>
          <h-number-input v-model="size" :min="64" :max="512" :step="32" />
          <label class="qrcode-generator__label">纠错级别</label>
          <h-select
            v-model="errorLevel"
            :options="[
              { label: 'L (7%)', value: 'L' },
              { label: 'M (15%)', value: 'M' },
              { label: 'Q (25%)', value: 'Q' },
              { label: 'H (30%)', value: 'H' }
            ]"
          />
        </div>
      </div>
      <div v-if="text" class="qrcode-generator__preview">
        <canvas ref="canvasRef" class="qrcode-generator__canvas"></canvas>
        <h-button type="primary" icon="mdi:download" @click="download">下载二维码</h-button>
      </div>
      <div v-else class="qrcode-generator__empty">
        <h-icon icon="mdi:qrcode" :size="64" color="var(--text-tertiary)" />
        <p>输入文本即可生成二维码</p>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const text = ref('https://supertools.app')
const size = ref(256)
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const canvasRef = ref<HTMLCanvasElement>()

async function generateQR(): Promise<void> {
  if (!text.value || !canvasRef.value) return
  try {
    await QRCode.toCanvas(canvasRef.value, text.value, {
      width: size.value,
      margin: 2,
      errorCorrectionLevel: errorLevel.value,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch {
    // 忽略
  }
}

function download(): void {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
  window.$he3?.message.success('二维码已下载')
}

watch([text, size, errorLevel], () => {
  generateQR()
})

onMounted(() => {
  generateQR()
})
</script>

<style scoped lang="less">
.qrcode-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__input {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    width: 100%;
  }

  &__options {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  &__preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  &__canvas {
    border-radius: var(--radius-sm);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px;
    color: var(--text-tertiary);
  }
}
</style>
