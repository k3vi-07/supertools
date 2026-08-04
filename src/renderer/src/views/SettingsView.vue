<template>
  <div class="settings-view">
    <h1 class="settings-view__title">{{ t('settings.title') }}</h1>

    <h-card-box :text="t('settings.theme')" icon="mdi:palette">
      <div class="settings-row">
        <span>{{ t('settings.darkMode') }}</span>
        <h-switch
          :model-value="settingsStore.theme === 'dark'"
          @update:model-value="(val) => settingsStore.setTheme(val ? 'dark' : 'light')"
        />
      </div>
    </h-card-box>

    <h-card-box :text="t('settings.language')" icon="mdi:translate">
      <div class="settings-row">
        <span>中文 / English</span>
        <h-radio
          :model-value="settingsStore.lang"
          :options="[
            { label: '中文', value: 'zh' },
            { label: 'English', value: 'en' }
          ]"
          @update:model-value="(val) => settingsStore.setLang(val as 'zh' | 'en')"
        />
      </div>
    </h-card-box>

    <h-card-box :text="t('settings.shortcut')" icon="mdi:keyboard-outline">
      <div class="settings-row">
        <div>
          <div>{{ t('settings.mainShortcut') }}</div>
          <div class="settings-row__hint">显示/隐藏主窗口</div>
        </div>
        <kbd class="settings-kbd">{{ isMac ? 'Option' : 'Alt' }} + Space</kbd>
      </div>
      <div class="settings-row">
        <div>
          <div>{{ t('settings.searchShortcut') }}</div>
          <div class="settings-row__hint">打开快速搜索</div>
        </div>
        <kbd class="settings-kbd">{{ isMac ? '⌘' : 'Ctrl' }} + Shift + Space</kbd>
      </div>
      <div class="settings-row">
        <div>
          <div>应用内搜索</div>
          <div class="settings-row__hint">在主窗口内搜索工具</div>
        </div>
        <kbd class="settings-kbd">{{ isMac ? '⌘' : 'Ctrl' }} + K</kbd>
      </div>
    </h-card-box>

    <h-card-box :text="t('settings.update.title')" icon="mdi:cloud-sync-outline">
      <div class="settings-row">
        <span>{{ t('settings.update.currentVersion') }}</span>
        <span class="update-version">v{{ updaterStore.currentVersion || '1.0.0' }}</span>
      </div>

      <!-- 状态展示区 -->
      <div v-if="updaterStore.status !== 'idle'" class="update-status">
        <!-- 检查中 -->
        <div v-if="updaterStore.status === 'checking'" class="update-status__item update-status__item--info">
          <h-icon icon="mdi:loading mdi-spin" :size="16" />
          <span>{{ t('settings.update.checking') }}</span>
        </div>

        <!-- 发现新版本 -->
        <div v-else-if="updaterStore.status === 'available'" class="update-status__item update-status__item--success">
          <h-icon icon="mdi:cloud-download-outline" :size="16" />
          <span>{{ t('settings.update.available') }} v{{ updaterStore.availableVersion }}</span>
        </div>

        <!-- 已是最新 -->
        <div v-else-if="updaterStore.status === 'not-available'" class="update-status__item update-status__item--success">
          <h-icon icon="mdi:check-circle-outline" :size="16" />
          <span>{{ t('settings.update.upToDate') }}</span>
        </div>

        <!-- 下载中 -->
        <div v-else-if="updaterStore.status === 'downloading'" class="update-status__item update-status__item--info">
          <span>{{ t('settings.update.downloading') }} {{ updaterStore.progress }}%</span>
          <div class="update-progress">
            <div class="update-progress__bar" :style="{ width: updaterStore.progress + '%' }"></div>
          </div>
        </div>

        <!-- 下载完成 -->
        <div v-else-if="updaterStore.status === 'downloaded'" class="update-status__item update-status__item--success">
          <h-icon icon="mdi:check-circle" :size="16" />
          <span>{{ t('settings.update.downloaded') }}</span>
        </div>

        <!-- 错误 -->
        <div v-else-if="updaterStore.status === 'error'" class="update-status__item update-status__item--error">
          <h-icon icon="mdi:alert-circle-outline" :size="16" />
          <span>{{ t('settings.update.error') }}: {{ updaterStore.errorMessage }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="update-actions">
        <h-button
          v-if="updaterStore.status !== 'checking' && updaterStore.status !== 'downloading' && updaterStore.status !== 'downloaded'"
          type="primary"
          size="small"
          :icon="'mdi:refresh'"
          @click="updaterStore.checkForUpdates()"
        >
          {{ t('settings.update.checkNow') }}
        </h-button>

        <h-button
          v-if="updaterStore.status === 'downloaded'"
          type="primary"
          size="small"
          :icon="'mdi:restart'"
          @click="updaterStore.installUpdate()"
        >
          {{ t('settings.update.installNow') }}
        </h-button>

        <a
          class="update-link"
          @click="openReleaseNotes"
        >
          {{ t('settings.update.releaseNotes') }}
        </a>
      </div>
    </h-card-box>

    <h-card-box :text="t('settings.about')" icon="mdi:information-outline">
      <div class="about-info">
        <div class="about-info__row">
          <span class="about-info__label">应用名称</span>
          <span>SuperTools</span>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">版本</span>
          <span>v{{ updaterStore.currentVersion || '1.0.0' }}</span>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">描述</span>
          <span>开发者超级工具箱，灵感来自 He3</span>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">技术栈</span>
          <span>Electron + Vue 3 + TypeScript</span>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">工具总数</span>
          <span>{{ toolsStore.tools.length }} 个</span>
        </div>
      </div>
    </h-card-box>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { useToolsStore } from '../stores/tools'
import { useUpdaterStore } from '../stores/updater'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const toolsStore = useToolsStore()
const updaterStore = useUpdaterStore()

const isMac = navigator.platform.toUpperCase().includes('MAC')

/** 打开发布说明页面 */
function openReleaseNotes(): void {
  window.$he3?.shellOpenExternal('https://github.com/k3vi-07/supertools/releases')
}
</script>

<style scoped lang="less">
.settings-view {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.settings-view__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

:deep(.h-card-box) {
  margin-bottom: 16px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: var(--text-primary);

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color-light);
  }

  &__hint {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 2px;
  }
}

.settings-kbd {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-base);
  font-size: 12px;
  font-family: 'SF Mono', Menlo, monospace;
  color: var(--text-secondary);
}

.update-version {
  font-family: 'SF Mono', Menlo, monospace;
  color: var(--text-secondary);
  font-size: 13px;
}

.update-status {
  padding: 8px 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    margin-bottom: 8px;

    &--info {
      background: rgba(99, 102, 241, 0.1);
      color: var(--color-primary);
    }

    &--success {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    &--error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }
}

.update-progress {
  width: 100%;
  height: 4px;
  background: var(--bg-base);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: var(--color-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
}

.update-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.update-link {
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.about-info {
  &__row {
    display: flex;
    padding: 6px 0;
    font-size: 13px;

    &:not(:last-child) {
      border-bottom: 1px solid var(--border-color-light);
    }
  }

  &__label {
    width: 100px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }
}
</style>
