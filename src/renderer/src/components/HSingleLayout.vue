<template>
  <div class="h-single-layout" :class="`mode-${mode}`">
    <div class="h-single-layout__content" :style="{ maxWidth: width ? `${width}px` : undefined }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    mode?: 'left' | 'middle' | 'right'
    width?: number
  }>(),
  {
    mode: 'middle',
    width: 0
  }
)
</script>

<style scoped lang="less">
.h-single-layout {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 24px;
  overflow: auto;

  &.mode-left {
    justify-content: flex-start;
  }
  &.mode-middle {
    justify-content: center;
  }
  &.mode-right {
    justify-content: flex-end;
  }

  &__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
