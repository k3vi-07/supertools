<template>
  <div class="h-horizontal-layout" :class="`mode-${mode}`">
    <div class="h-horizontal-layout__left" :style="leftStyle">
      <slot name="left">
        <slot />
      </slot>
    </div>
    <div class="h-horizontal-layout__right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    mode?: 'left' | 'middle' | 'right'
    width?: number
  }>(),
  {
    mode: 'middle',
    width: 0
  }
)

const leftStyle = computed(() => {
  if (props.mode === 'left' && props.width) {
    return { flex: `0 0 ${props.width}px` }
  }
  return {}
})
</script>

<style scoped lang="less">
.h-horizontal-layout {
  display: flex;
  gap: 16px;
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow: hidden;

  &__left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__right {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &.mode-left {
    .h-horizontal-layout__left {
      flex: 0 0 auto;
    }
  }
}
</style>
