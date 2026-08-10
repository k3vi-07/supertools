<template>
  <div class="app-container" :class="{ 'is-overlay': isOverlayMode }">
    <!-- 全局搜索浮层窗口模式 -->
    <SearchView v-if="isOverlayMode" />

    <!-- 主界面布局 -->
    <MainLayout v-else />

    <!-- 全局消息提示 -->
    <HMessageContainer />

    <!-- 首次启动引导 -->
    <OnboardingOverlay v-if="!isOverlayMode" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import SearchView from './views/SearchView.vue'
import HMessageContainer from './components/HMessageContainer.vue'
import OnboardingOverlay from './components/OnboardingOverlay.vue'

const route = useRoute()

/** 是否为全局搜索浮层窗口模式（独立透明窗口） */
const isOverlayMode = computed((): boolean => route.name === 'search')

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('supertools:theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)

  // 监听导航事件（从搜索浮层触发）
  window.supertools?.onNavigate((toolId: string) => {
    // 导航到工具
    const router = (window as unknown as { __router?: { push: (path: string) => void } }).__router
    if (router) {
      router.push(`/tool/${toolId}`)
    }
  })
})
</script>

<style scoped lang="less">
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.is-overlay {
    background: transparent;
  }
}
</style>
