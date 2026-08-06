<template>
  <div class="settings-view">
    <h1 class="settings-view__title">{{ t('settings.title') }}</h1>

    <h-card-box :text="t('settings.theme')" icon="mdi:palette">
      <div class="settings-row">
        <span>{{ t('settings.darkMode') }}</span>
        <h-switch
          :model-value="settingsStore.theme === 'dark'"
          @update:model-value="(val: boolean) => settingsStore.setTheme(val ? 'dark' : 'light')"
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
          @update:model-value="(val: unknown) => settingsStore.setLang(val as 'zh' | 'en')"
        />
      </div>
    </h-card-box>

    <h-card-box :text="t('settings.shortcut')" icon="mdi:keyboard-outline">
      <div class="settings-row">
        <div>
          <div>{{ t('settings.mainShortcut') }}</div>
          <div class="settings-row__hint">{{ t('settings.shortcutHintMain') }}</div>
        </div>
        <ShortcutRecorder
          :model-value="settingsStore.mainShortcut"
          :default-value="defaultShortcuts.main"
          @recorded="(acc) => onSaveShortcut('main', acc)"
        />
      </div>
      <div class="settings-row">
        <div>
          <div>{{ t('settings.searchShortcut') }}</div>
          <div class="settings-row__hint">{{ t('settings.shortcutHintSearch') }}</div>
        </div>
        <ShortcutRecorder
          :model-value="settingsStore.searchShortcut"
          :default-value="defaultShortcuts.search"
          @recorded="(acc) => onSaveShortcut('search', acc)"
        />
      </div>
      <div class="settings-row">
        <div>
          <div>{{ t('settings.appSearchShortcut') }}</div>
          <div class="settings-row__hint">{{ t('settings.shortcutHintAppSearch') }}</div>
        </div>
        <ShortcutRecorder
          :model-value="settingsStore.appSearchShortcut"
          :default-value="defaultShortcuts.appSearch"
          @recorded="(acc) => onSaveShortcut('appSearch', acc)"
        />
      </div>
      <div v-if="shortcutError" class="settings-shortcut-error">{{ shortcutError }}</div>
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
        <div class="about-info__row">
          <span class="about-info__label">作者</span>
          <div class="about-info__links">
            <a class="about-info__link" @click="openUrl('https://github.com/k3vi-07')">k3vi-07</a>
          </div>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">项目仓库</span>
          <div class="about-info__links">
            <a class="about-info__link" @click="openUrl('https://github.com/k3vi-07/supertools')">
              <h-icon icon="mdi:github" :size="14" />
              k3vi-07/supertools
            </a>
          </div>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">社区工具仓库</span>
          <div class="about-info__links">
            <a class="about-info__link" @click="openUrl('https://github.com/k3vi-07/supertools-community')">
              <h-icon icon="mdi:github" :size="14" />
              k3vi-07/supertools-community
            </a>
          </div>
        </div>
        <div class="about-info__row">
          <span class="about-info__label">许可证</span>
          <span>MIT License © 2026 k3vi-07</span>
        </div>
      </div>
    </h-card-box>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { useToolsStore } from '../stores/tools'
import { useUpdaterStore } from '../stores/updater'
import ShortcutRecorder from '../components/ShortcutRecorder.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const toolsStore = useToolsStore()
const updaterStore = useUpdaterStore()

const isMac = navigator.platform.toUpperCase().includes('MAC')

/** 默认快捷键值 */
const defaultShortcuts = {
  main: isMac ? 'Alt+Space' : 'Alt+Space',
  search: isMac ? 'Command+Shift+Space' : 'Ctrl+Shift+Space',
  appSearch: isMac ? 'Command+K' : 'Ctrl+K'
}

/** 快捷键保存错误提示 */
const shortcutError = ref('')

/** 保存快捷键 */
async function onSaveShortcut(type: 'main' | 'search' | 'appSearch', accelerator: string): Promise<void> {
  shortcutError.value = ''
  const result = await settingsStore.setShortcut(type, accelerator)
  if (!result.ok) {
    shortcutError.value = result.error || t('settings.shortcutFailed')
    window.$he3?.message.error(result.error || t('settings.shortcutFailed'))
  } else {
    window.$he3?.message.success(accelerator ? t('settings.shortcutUpdated') : t('settings.shortcutDisabledMsg'))
  }
}

/** 打开发布说明页面 */
function openReleaseNotes(): void {
  window.$he3?.shellOpenExternal('https://github.com/k3vi-07/supertools/releases')
}

/** 打开外部链接 */
function openUrl(url: string): void {
  window.$he3?.shellOpenExternal(url)
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

.settings-shortcut-error {
  padding: 8px 12px;
  margin-top: 8px;
  border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 12px;
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

  &__links {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-primary);
    cursor: pointer;
    font-size: 13px;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }
}
</style>
