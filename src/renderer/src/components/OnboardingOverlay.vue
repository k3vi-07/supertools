<template>
  <Teleport to="body">
    <Transition name="onboarding">
      <div v-if="visible" class="onboarding">
        <div class="onboarding__card">
          <!-- 步骤内容 -->
          <div class="onboarding__content">
            <!-- 步骤 1: 欢迎 -->
            <template v-if="step === 0">
              <div class="onboarding__hero">
                <img src="../assets/icon.png" alt="SuperTools" class="onboarding__logo" />
                <h1 class="onboarding__title">欢迎使用 SuperTools</h1>
                <p class="onboarding__subtitle">{{ toolCount }}+ 开发者工具，触手可及</p>
              </div>
              <div class="onboarding__features">
                <div class="onboarding__feature">
                  <h-icon icon="mdi:lightning-bolt" :size="24" color="var(--color-primary)" />
                  <span>本地工具秒开，无需联网</span>
                </div>
                <div class="onboarding__feature">
                  <h-icon icon="mdi:cloud-download-outline" :size="24" color="var(--color-primary)" />
                  <span>社区工具商店，持续扩展</span>
                </div>
                <div class="onboarding__feature">
                  <h-icon icon="mdi:clipboard-auto-outline" :size="24" color="var(--color-primary)" />
                  <span>剪贴板智能识别，自动推荐</span>
                </div>
              </div>
            </template>

            <!-- 步骤 2: 快捷键 -->
            <template v-else-if="step === 1">
              <h2 class="onboarding__step-title">效率快捷键</h2>
              <p class="onboarding__step-desc">记住这些快捷键，工具随叫随到</p>
              <div class="onboarding__shortcuts">
                <div class="onboarding__shortcut">
                  <div class="onboarding__shortcut-keys">
                    <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
                    <kbd>K</kbd>
                  </div>
                  <div class="onboarding__shortcut-desc">
                    <strong>搜索工具</strong>
                    <span>在主窗口内快速搜索任意工具</span>
                  </div>
                </div>
                <div class="onboarding__shortcut">
                  <div class="onboarding__shortcut-keys">
                    <kbd>{{ isMac ? '⌥' : 'Alt' }}</kbd>
                    <kbd>Space</kbd>
                  </div>
                  <div class="onboarding__shortcut-desc">
                    <strong>呼出/隐藏主窗口</strong>
                    <span>全局快捷键，随时调出</span>
                  </div>
                </div>
                <div class="onboarding__shortcut">
                  <div class="onboarding__shortcut-keys">
                    <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
                    <kbd>⇧</kbd>
                    <kbd>Space</kbd>
                  </div>
                  <div class="onboarding__shortcut-desc">
                    <strong>全局搜索浮层</strong>
                    <span>不切换窗口也能搜工具</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 步骤 3: 剪贴板 -->
            <template v-else-if="step === 2">
              <h2 class="onboarding__step-title">智能剪贴板识别</h2>
              <p class="onboarding__step-desc">复制了什么，就推荐什么工具</p>
              <div class="onboarding__clipboard-demo">
                <div class="onboarding__clipboard-item">
                  <code>eyJhbGciOi...</code>
                  <span class="onboarding__clipboard-arrow">→</span>
                  <div class="onboarding__clipboard-tool">
                    <h-icon icon="mdi:key-variant" :size="18" />
                    JWT 解码
                  </div>
                </div>
                <div class="onboarding__clipboard-item">
                  <code>#1a1a2e</code>
                  <span class="onboarding__clipboard-arrow">→</span>
                  <div class="onboarding__clipboard-tool">
                    <h-icon icon="mdi:palette" :size="18" />
                    颜色转换
                  </div>
                </div>
                <div class="onboarding__clipboard-item">
                  <code>{"name":"test"}</code>
                  <span class="onboarding__clipboard-arrow">→</span>
                  <div class="onboarding__clipboard-tool">
                    <h-icon icon="mdi:code-json" :size="18" />
                    JSON 格式化
                  </div>
                </div>
              </div>
              <p class="onboarding__tip">打开应用时，首页顶部会自动显示推荐</p>
            </template>

            <!-- 步骤 4: 工具商店 -->
            <template v-else-if="step === 3">
              <h2 class="onboarding__step-title">探索社区工具</h2>
              <p class="onboarding__step-desc">点击侧栏「工具商店」，获取 30+ 社区远程工具</p>
              <div class="onboarding__store-preview">
                <div class="onboarding__store-item" v-for="cat in storeCats" :key="cat.name">
                  <h-icon :icon="cat.icon" :size="28" color="var(--color-primary)" />
                  <span>{{ cat.name }}</span>
                </div>
              </div>
              <p class="onboarding__tip">远程工具安装后会缓存到本地，离线也能用</p>
            </template>
          </div>

          <!-- 底部控制区 -->
          <div class="onboarding__footer">
            <!-- 进度指示器 -->
            <div class="onboarding__dots">
              <div
                v-for="i in 4"
                :key="i"
                class="onboarding__dot"
                :class="{ active: step === i - 1, done: step > i - 1 }"
                @click="step = i - 1"
              />
            </div>

            <div class="onboarding__actions">
              <button v-if="step > 0" class="onboarding__btn onboarding__btn--secondary" @click="step--">
                上一步
              </button>
              <button class="onboarding__btn onboarding__btn--ghost" @click="finish">
                跳过
              </button>
              <button v-if="step < 3" class="onboarding__btn onboarding__btn--primary" @click="step++">
                下一步
              </button>
              <button v-else class="onboarding__btn onboarding__btn--primary" @click="finish">
                开始使用
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToolsStore } from '../stores/tools'
import { useRemoteToolsStore } from '../stores/remoteTools'

const ONBOARDED_KEY = 'supertools:onboarded'

const toolsStore = useToolsStore()
const remoteToolsStore = useRemoteToolsStore()

const visible = ref(false)
const step = ref(0)

const isMac = navigator.platform.toUpperCase().includes('MAC')

const toolCount = computed(() => toolsStore.tools.length + remoteToolsStore.installedTools.length)

const storeCats = [
  { name: '加密哈希', icon: 'mdi:shield-key-outline' },
  { name: 'JSON 工具', icon: 'mdi:code-json' },
  { name: '文本处理', icon: 'mdi:format-text' },
  { name: '网络工具', icon: 'mdi:lan' },
  { name: '编程辅助', icon: 'mdi:code-braces' },
  { name: '更多...', icon: 'mdi:dots-horizontal' }
]

// 检查是否首次启动
try {
  const onboarded = localStorage.getItem(ONBOARDED_KEY)
  if (!onboarded) {
    visible.value = true
  }
} catch {
  // 忽略
}

function finish(): void {
  localStorage.setItem(ONBOARDED_KEY, Date.now().toString())
  visible.value = false
}
</script>

<style scoped lang="less">
.onboarding {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.onboarding__card {
  width: 520px;
  max-width: 90vw;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.onboarding__content {
  padding: 40px 36px 24px;
  min-height: 320px;
}

/* 步骤 1: 欢迎 */
.onboarding__hero {
  text-align: center;
  margin-bottom: 28px;
}

.onboarding__logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.onboarding__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.onboarding__subtitle {
  font-size: 15px;
  color: var(--text-secondary);
}

.onboarding__features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.onboarding__feature {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--bg-base);
  font-size: 14px;
  color: var(--text-primary);
}

/* 步骤标题 */
.onboarding__step-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.onboarding__step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* 步骤 2: 快捷键 */
.onboarding__shortcuts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.onboarding__shortcut {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--bg-base);
}

.onboarding__shortcut-keys {
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--border-color);
    border-bottom-width: 2px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-surface);
  }
}

.onboarding__shortcut-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    color: var(--text-primary);
  }

  span {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

/* 步骤 3: 剪贴板 */
.onboarding__clipboard-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.onboarding__clipboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-base);

  code {
    font-family: monospace;
    font-size: 13px;
    color: var(--color-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.onboarding__clipboard-arrow {
  color: var(--text-tertiary);
  font-size: 16px;
}

.onboarding__clipboard-tool {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  flex-shrink: 0;
}

.onboarding__tip {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
}

/* 步骤 4: 商店 */
.onboarding__store-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.onboarding__store-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 12px;
  border-radius: 12px;
  background: var(--bg-base);
  font-size: 12px;
  color: var(--text-secondary);
}

/* 底部 */
.onboarding__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-base);
}

.onboarding__dots {
  display: flex;
  gap: 8px;
}

.onboarding__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.active {
    width: 24px;
    border-radius: 4px;
    background: var(--color-primary);
  }

  &.done {
    background: color-mix(in srgb, var(--color-primary) 50%, transparent);
  }
}

.onboarding__actions {
  display: flex;
  gap: 8px;
}

.onboarding__btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--primary {
    background: var(--color-primary);
    color: white;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
    }
  }

  &--secondary {
    background: var(--bg-hover);
    color: var(--text-primary);

    &:hover {
      background: var(--border-color);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-tertiary);

    &:hover {
      color: var(--text-secondary);
    }
  }
}

/* 动画 */
.onboarding-enter-active,
.onboarding-leave-active {
  transition: opacity 0.25s ease;

  .onboarding__card {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
}

.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;

  .onboarding__card {
    transform: scale(0.95);
    opacity: 0;
  }
}
</style>
