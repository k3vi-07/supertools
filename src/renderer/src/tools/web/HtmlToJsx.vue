<template>
  <h-single-layout>
    <h-transform
      left-title="HTML 输入"
      right-title="JSX 输出"
      input-lang="html"
      output-lang="javascript"
      sample-data="<div class=&quot;container&quot;>\n  <h1 id=&quot;title&quot;>Hello World</h1>\n  <button class=&quot;btn&quot; onclick=&quot;handleClick()&quot;>Click</button>\n  <input type=&quot;text&quot; value=&quot;&quot; />\n  <label for=&quot;name&quot;>Name</label>\n  <img src=&quot;logo.png&quot; alt=&quot;logo&quot; />\n</div>"
      :input-handler="convertFn"
    />
  </h-single-layout>
</template>

<script setup lang="ts">
function convertFn(input: string): string {
  let result = input
  // class → className
  result = result.replace(/\bclass=/g, 'className=')
  // for → htmlFor
  result = result.replace(/\bfor=/g, 'htmlFor=')
  // onclick → onClick
  result = result.replace(/\bonclick=/g, 'onClick=')
  result = result.replace(/\bonchange=/g, 'onChange=')
  result = result.replace(/\bonsubmit=/g, 'onSubmit=')
  result = result.replace(/\bonfocus=/g, 'onFocus=')
  result = result.replace(/\bonblur=/g, 'onBlur=')
  // 自闭合标签处理（img, input, br, hr 等已经是自闭合的）
  // 将 HTML 实体编码的引号还原
  result = result.replace(/&quot;/g, '"')
  // tabindex → tabIndex
  result = result.replace(/\btabindex=/g, 'tabIndex=')
  // readonly → readOnly
  result = result.replace(/\breadonly=/g, 'readOnly=')
  // maxlength → maxLength
  result = result.replace(/\bmaxlength=/g, 'maxLength=')
  // cellspacing → cellSpacing
  result = result.replace(/\bcellspacing=/g, 'cellSpacing=')
  // cellpadding → cellPadding
  result = result.replace(/\bcellpadding=/g, 'cellPadding=')
  // colspan → colSpan
  result = result.replace(/\bcolspan=/g, 'colSpan=')
  // rowspan → rowSpan
  result = result.replace(/\browspan=/g, 'rowSpan=')

  return result
}
</script>
