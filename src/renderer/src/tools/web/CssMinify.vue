<template>
  <h-single-layout>
    <h-transform
      left-title="CSS 输入"
      right-title="压缩结果"
      input-lang="css"
      output-lang="css"
      sample-data=".container {\n  display: flex;\n  /* 主容器 */\n  flex-direction: column;\n  padding: 16px 24px;\n  margin: 0 auto;\n}\n\n.button {\n  color: #ffffff;\n  background: #7c3aed;\n  border-radius: 8px;\n  border: none;\n  padding: 8px 16px;\n  font-size: 14px;\n  font-weight: 600;\n}"
      :input-handler="minifyFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
function minifyFn(input: string): string {
  return input
    // 移除注释
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 移除前后空格
    .replace(/^\s+|\s+$/g, '')
    // 移除选择器后面的空格
    .replace(/\s*{\s*/g, '{')
    // 移除属性后的空格
    .replace(/\s*:\s*/g, ':')
    // 移除分号后的空格
    .replace(/\s*;\s*/g, ';')
    // 移除逗号后的空格（但保留媒体查询中的空格）
    .replace(/\s*,\s*/g, ',')
    // 合并多个换行
    .replace(/\n+/g, '')
    // 合并多个空格
    .replace(/\s+/g, ' ')
    // 移除最后的分号
    .replace(/;}/g, '}')
    .trim()
}
</script>
