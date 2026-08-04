import { h, defineComponent, type Component } from 'vue'
import HTransform from '../components/HTransform.vue'

/** transformTool 的选项 */
export interface TransformToolOptions {
  /** 输入编辑器语言 */
  inputLang?: string
  /** 输出编辑器语言 */
  outputLang?: string
  /** 输入占位符 */
  inputPlaceholder?: string
  /** 示例数据 */
  sampleData?: string
  /** 左侧标题 */
  inputTitle?: string
  /** 右侧标题 */
  outputTitle?: string
  /** 转换函数 */
  inputHandler?: (input: string) => string | Promise<string>
  /** 逆向转换函数 */
  resultHandler?: (output: string) => string | Promise<string>
  /** 自动回填条件 */
  autoFillInputCondition?: (str: string) => boolean | null
}

/**
 * transformTool - 创建代码转换工具组件
 * 复刻 He3 @he3-kit/utils 的 transformTool
 */
export function transformTool(options: TransformToolOptions): Component {
  return defineComponent({
    name: 'TransformTool',
    render() {
      return h(HTransform, {
        inputLang: options.inputLang || 'text',
        outputLang: options.outputLang || 'text',
        inputPlaceholder: options.inputPlaceholder || '请输入...',
        sampleData: options.sampleData || '',
        leftTitle: options.inputTitle || 'Input',
        rightTitle: options.outputTitle || 'Output',
        inputHandler: options.inputHandler,
        resultHandler: options.resultHandler,
        autoFillInputCondition: options.autoFillInputCondition
      })
    }
  })
}

/** textTransformTool 的选项 */
export interface TextTransformToolOptions {
  /** 输入占位符 */
  inputPlaceholder?: string
  /** 示例数据 */
  sampleData?: string
  /** 是否启用反向转换 */
  enableReverse?: boolean
  /** 转换函数 */
  inputHandler?: (input: string) => string | Promise<string>
  /** 逆向转换函数 */
  resultHandler?: (output: string) => string | Promise<string>
  /** 自动回填条件 */
  autoFillInputCondition?: (str: string) => boolean | null
}

/**
 * textTransformTool - 创建文本转换工具组件
 * 复刻 He3 @he3-kit/utils 的 textTransformTool
 */
export function textTransformTool(options: TextTransformToolOptions): Component {
  // 动态导入避免循环依赖
  return defineComponent({
    name: 'TextTransformTool',
    async setup() {
      const HTextTransform = (await import('../components/HTextTransform.vue')).default
      return () =>
        h(HTextTransform, {
          inputPlaceholder: options.inputPlaceholder || '请输入文本...',
          sampleData: options.sampleData || '',
          enableReverse: options.enableReverse || false,
          transform: options.inputHandler,
          reverseTransform: options.resultHandler,
          autoFillInputCondition: options.autoFillInputCondition
        })
    }
  })
}

/** JSON 示例数据 */
export const JsonExample = `{
  "name": "SuperTools",
  "version": "1.0.0",
  "description": "开发者工具箱",
  "features": ["搜索", "剪贴板识别", "个性化主页"],
  "openSource": true
}`

/** 判断是否为有效 JSON */
export function isJson(str: string): boolean {
  try {
    const parsed = JSON.parse(str)
    return typeof parsed === 'object' && parsed !== null
  } catch {
    return false
  }
}
