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

    <h-card-box :text="t('settings.about')" icon="mdi:information-outline">
      <div class="about-info">
        <div class="about-info__row">
          <span class="about-info__label">应用名称</span>
          <span>SuperTools</span>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">版本</span>
          <span>1.0.0</span>
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

const { t } = useI18n()
const settingsStore = useSettingsStore()
const toolsStore = useToolsStore()

const isMac = navigator.platform.toUpperCase().includes('MAC')
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
