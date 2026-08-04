<template>
  <div class="app-container" :class="{ 'is-search-mode': isSearchMode }">
    <!-- 主界面布局 -->
    <MainLayout v-if="!isSearchMode" />

    <!-- 搜索浮层模式 -->
    <SearchView v-else />

    <!-- 全局消息提示 -->
    <HMessageContainer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import SearchView from './views/SearchView.vue'
import HMessageContainer from './components/HMessageContainer.vue'

const route = useRoute()

/** 是否搜索模式 */
const isSearchMode = computed((): boolean => route.name === 'search')

onMounted(() => {
  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'dark'
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

  &.is-search-mode {
    background: transparent;
  }
}
</style>
