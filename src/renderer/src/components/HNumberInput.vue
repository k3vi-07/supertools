<template>
  <div class="h-number-input">
    <button class="h-number-input__btn" :disabled="modelValue <= min" @click="decrease">
      <h-icon icon="mdi:minus" :size="14" />
    </button>
    <input
      :value="modelValue"
      type="number"
      :step="step"
      :min="min"
      :max="max"
      class="h-number-input__input"
      @input="handleInput"
    />
    <button class="h-number-input__btn" :disabled="modelValue >= max" @click="increase">
      <h-icon icon="mdi:plus" :size="14" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    step?: number
    min?: number
    max?: number
  }>(),
  {
    step: 1,
    min: -Infinity,
    max: Infinity
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function handleInput(e: Event): void {
  const value = Number((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    emit('update:modelValue', value)
  }
}

function increase(): void {
  const newVal = Math.min(props.modelValue + props.step, props.max)
  emit('update:modelValue', newVal)
}

function decrease(): void {
  const newVal = Math.max(props.modelValue - props.step, props.min)
  emit('update:modelValue', newVal)
}
</script>

<style scoped lang="less">
.h-number-input {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;

  &__input {
    width: 60px;
    text-align: center;
    border: none;
    border-left: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    padding: 4px 0;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: var(--bg-surface);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
</style>
