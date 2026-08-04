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

/** 注册所有 h- 前缀的全局组件 */
export function registerComponents(app: App): void {
  app.component('h-transform', HTransform)
  app.component('h-text-transform', HTextTransform)
  app.component('h-single-layout', HSingleLayout)
  app.component('h-horizontal-layout', HHorizontalLayout)
  app.component('h-input', HInput)
  app.component('h-multiline-input', HMultilineInput)
  app.component('h-code-editor', HCodeEditor)
  app.component('h-button', HButton)
  app.component('h-text-copy', HTextCopyButton)
  app.component('h-radio', HRadio)
  app.component('h-select', HSelect)
  app.component('h-icon', HIcon)
  app.component('h-checkbox', HCheckbox)
  app.component('h-switch', HSwitch)
  app.component('h-number-input', HNumberInput)
  app.component('h-card-box', HCardBox)
  app.component('h-kv-input', HKeyValueInput)
}
