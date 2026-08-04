<template>
  <h-single-layout>
    <div class="markdown-preview">
      <div class="markdown-preview__panels">
        <div class="markdown-preview__panel">
          <div class="markdown-preview__header">Markdown 输入</div>
          <textarea
            v-model="markdown"
            class="markdown-preview__textarea selectable"
            spellcheck="false"
          />
        </div>
        <div class="markdown-preview__panel">
          <div class="markdown-preview__header">预览</div>
          <div class="markdown-preview__preview selectable" v-html="htmlOutput"></div>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const markdown = ref(`# SuperTools Markdown 预览

## 功能特性
- **粗体文本** 和 *斜体文本*
- 支持 \`行内代码\`
- [超链接](https://supertools.app)

## 代码块
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

> 这是一段引用文本

## 表格
| 工具 | 说明 |
|------|------|
| JSON | 格式化 |
| Base64 | 编解码 |

1. 有序列表项 1
2. 有序号表项 2`)

const htmlOutput = computed(() => {
  return mdToHtml(markdown.value)
})

/** 简易 Markdown → HTML 转换 */
function mdToHtml(md: string): string {
  let html = md
  // 转义 HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) =>
    `<pre><code>${code.trim()}</code></pre>`
  )

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 行内代码
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')

  // 链接
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')

  // 引用
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

  // 表格
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter((c) => c.trim())
    if (cells.some((c) => /^[-:]+$/.test(c.trim()))) return '' // 分隔行
    const tag = 'td'
    return `<tr>${cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`
  })
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\s*)+/g, (match) => `<table>${match}</table>`)

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>')
  html = html.replace(/(<oli>[\s\S]*?<\/oli>\s*)+/g, (match) =>
    `<ol>${match.replace(/<\/?oli>/g, (m) => m === '</oli>' ? '</li>' : '<li>')}</ol>`)

  // 无序列表
  html = html.replace(/^[-*] (.+)$/gm, '<uli>$1</uli>')
  html = html.replace(/(<uli>[\s\S]*?<\/uli>\s*)+/g, (match) =>
    `<ul>${match.replace(/<\/?uli>/g, (m) => m === '</uli>' ? '</li>' : '<li>')}</ul>`)

  // 段落（连续非标签行）
  html = html.replace(/^(?!<[hupoblt])(.+)$/gm, '<p>$1</p>')

  return html
}
</script>

<style scoped lang="less">
.markdown-preview {
  &__panels {
    display: flex;
    gap: 12px;
    height: 500px;
  }

  &__panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__header {
    padding: 8px 12px;
    background: var(--bg-code-header);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  &__textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    padding: 12px;
    font-family: 'SF Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    background: var(--bg-code);
    color: var(--text-primary);
  }

  &__preview {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--bg-surface);

    :deep(h1) { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    :deep(h2) { font-size: 18px; font-weight: 600; margin: 16px 0 8px; }
    :deep(h3) { font-size: 15px; font-weight: 600; margin: 12px 0 6px; }
    :deep(p) { margin-bottom: 8px; line-height: 1.7; }
    :deep(code) {
      padding: 2px 6px;
      background: var(--bg-base);
      border-radius: 3px;
      font-family: monospace;
      font-size: 13px;
      color: var(--color-primary);
    }
    :deep(pre) {
      padding: 12px;
      background: var(--bg-base);
      border-radius: var(--radius-sm);
      overflow-x: auto;
      margin-bottom: 12px;

      code {
        padding: 0;
        background: none;
        color: var(--text-primary);
      }
    }
    :deep(blockquote) {
      padding: 8px 16px;
      border-left: 3px solid var(--color-primary);
      background: var(--bg-base);
      margin-bottom: 8px;
      color: var(--text-secondary);
    }
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;

      td {
        padding: 6px 12px;
        border: 1px solid var(--border-color);
      }
    }
    :deep(ul), :deep(ol) {
      padding-left: 24px;
      margin-bottom: 12px;
      line-height: 1.7;
    }
    :deep(a) { color: var(--color-primary); }
    :deep(strong) { font-weight: 700; }
  }
}
</style>
