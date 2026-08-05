import type { App } from 'vue'
import HTransform from './HTransform.vue'
import HTextTransform from './HTextTransform.vue'
import HSingleLayout from './HSingleLayout.vue'
import HHorizontalLayout from './HHorizontalLayout.vue'
import HInput from './HInput.vue'
import HMultilineInput from './HMultilineInput.vue'
import HCodeEditor from './HCodeEditor.vue'
import HButton from './HButton.vue'
import HTextCopyButton from './HTextCopyButton.vue'
import HRadio from './HRadio.vue'
import HSelect from './HSelect.vue'
import HIcon from './HIcon.vue'
import HCheckbox from './HCheckbox.vue'
import HSwitch from './HSwitch.vue'
import HNumberInput from './HNumberInput.vue'
import HMessageContainer from './HMessageContainer.vue'
import HCardBox from './HCardBox.vue'
import HKeyValueInput from './HKeyValueInput.vue'

/** 全局组件映射（供远程组件 sfc-loader 使用） */
export const globalComponents: Record<string, unknown> = {
  'h-transform': HTransform,
  'h-text-transform': HTextTransform,
  'h-single-layout': HSingleLayout,
  'h-horizontal-layout': HHorizontalLayout,
  'h-input': HInput,
  'h-multiline-input': HMultilineInput,
  'h-code-editor': HCodeEditor,
  'h-button': HButton,
  'h-text-copy': HTextCopyButton,
  'h-radio': HRadio,
  'h-select': HSelect,
  'h-icon': HIcon,
  'h-checkbox': HCheckbox,
  'h-switch': HSwitch,
  'h-number-input': HNumberInput,
  'h-card-box': HCardBox,
  'h-kv-input': HKeyValueInput
}

/** 注册所有 h- 前缀的全局组件 */
export function registerComponents(app: App): void {
  for (const [name, component] of Object.entries(globalComponents)) {
    app.component(name, component as never)
  }
}
